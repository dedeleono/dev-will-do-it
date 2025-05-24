"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { trpc } from "@/app/_trpc/client";
import { useEffect, useState } from "react";
import useTokenStore from "@/components/store/useTokenStore";

export default function TopTenHolders({
    mintAddress,
}: {
    mintAddress: string;
}) {
    const [totalSupply, setTotalSupply] = useState<number>(0);

    const { connection } = useConnection();
    const { curveInfo, tokenInfo } = useTokenStore((state) => state.stats);

    useEffect(() => {
        async function fetchAndSetTotalSupply() {
            const supply = await fetchTotalSupply(mintAddress);
            setTotalSupply(supply);
        }

        fetchAndSetTotalSupply();
    }, [mintAddress, connection]);
    const isVested = (tokenInfo?.vesting_interval.toNumber() || 0) > 0;
    const {
        data: holdersData,
        isLoading,
        isError,
    } = trpc.getTokenHolders.useQuery(
        {
            mint: isVested ? curveInfo.placeholderMint.toBase58() : mintAddress,
            baseMint: mintAddress,
            isPlaceholder: isVested,
        },
        {
            enabled: !!curveInfo,
        }
    );

    async function fetchTotalSupply(mintAddress: string) {
        const mintPublicKey = new PublicKey(mintAddress);
        try {
            const mintAccountInfo = await connection.getParsedAccountInfo(
                mintPublicKey
            );

            if (
                mintAccountInfo.value !== null &&
                mintAccountInfo.value.data instanceof Object &&
                "parsed" in mintAccountInfo.value.data
            ) {
                const mintData = mintAccountInfo.value.data.parsed;
                const totalSupply = mintData.info.supply;
                const decimals = mintData.info.decimals;

                return totalSupply / Math.pow(10, decimals);
            } else {
                console.error(
                    `Mint account not found or data is not parsed for ${mintAddress}`
                );
                return 0;
            }
        } catch (error) {
            console.error(
                `Error fetching total supply for ${mintAddress}:`,
                error
            );
            return 0;
        }
    }

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error loading holders</p>;

    const curveHolder = curveInfo?.tokenCurveHolder?.toBase58();

    if (holdersData) {
        const topTen = holdersData.topTen

        return (
            <div className="min-w-full w-full">
                <h4 className="mb-4">Top 10 Holders:</h4>
                <ol className="w-full space-y-2">
                    {topTen?.map((holder, index) => {
                        const percentage =
                            ((holder.amount / totalSupply) * 100) /
                            LAMPORTS_PER_SOL;

                        return (
                            <li
                                key={holder.owner}
                                className="text-md flex flex-row items-center"
                            >
                                <div>{index + 1}.</div>
                                <div className="underline underline-offset-1 text-sm w-full flex justify-between pl-1">
                                    {holder.owner &&
                                        `${holder.owner.slice(
                                            0,
                                            4
                                        )}...${holder.owner.slice(-4)}`}
                                </div>
                                {holder.owner === curveHolder ? (
                                    <div className="font-work text-xs">
                                        (curve)&nbsp;
                                    </div>
                                ) : (
                                    ""
                                )}
                                {/* <div>{holder.amount} Tokens</div> */}
                                <div>{percentage.toFixed(2)}&nbsp;%</div>
                            </li>
                        );
                    })}
                </ol>
                <div className="w-full min-w-full mt-3 bg-foreground rounded-md py-3 text-right scale-x-[1.02]">
                    <span className="text-background mr-1">
                        {" "}
                        {(
                            ((topTen.reduce(
                                (sum, holder) => sum + holder.amount,
                                0
                            ) /
                                totalSupply) *
                                100) /
                            LAMPORTS_PER_SOL
                        ).toFixed(2)}
                        &nbsp;%
                    </span>
                </div>
            </div>
        );
    }

    // Calculate the total percentage held by the top 10 holders
    // const totalPercentageOfTopTen = Object.values(balances)
    //     .reduce((sum, balance) => {
    //         return sum + (totalSupply ? (balance / totalSupply) * 100 : 0);
    //     }, 0)
    //     .toFixed(2);
}

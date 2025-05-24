"use client";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { trpc } from "@/app/_trpc/client";
import { RingsLoader } from "@/components/shared/Loaders";
import useTokenStore from "@/components/store/useTokenStore";
import { getPrice } from "@/utils/curveMath";
import { BN } from "@coral-xyz/anchor";
import { useEffect } from "react";

export default function RaiseDataStrip({
    tokenAddress,
}: {
    tokenAddress: string;
}) {
    const { stats, solanaPrice } = useTokenStore((state) => ({
        stats: state.stats,
        solanaPrice: state.solanaPrice,
    }));
    const {
        data: volumeData,
        isLoading: isVolumeLoading,
        refetch: refetchVolume,
    } = trpc.getRaiseVolume.useQuery(tokenAddress, {
        enabled: !!stats.curveInfo,
    });
    const isVested = stats.tokenInfo?.vesting_interval.gt(new BN(0));
    const placeholderMint = stats.curveInfo?.placeholderMint.toBase58() || "";
    const reserveSupply = stats.curveInfo?.reserveInCurve.uiAmount || 0;
    const {
        data: holderData,
        isLoading,
        refetch,
    } = trpc.getTokenHolders.useQuery(
        {
            mint: isVested ? placeholderMint : tokenAddress,
            baseMint: tokenAddress,
            isPlaceholder: isVested,
        },
        {
            enabled: !!stats.curveInfo && !!placeholderMint,
        }
    );
    const currentPrice = stats
        ? getPrice(
              parseInt(stats.curveInfo?.tokensSold?.toString()) / 1e9,
              stats.tokenInfo?.slope_numerator,
              stats.tokenInfo?.slope_denominator
          )
        : 0;
    const marketCap = currentPrice * 1_000_000_000;
    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 10000);
        return () => clearInterval(interval);
    }, [refetch]);
    console.log({ volumeData });
    return (
        <div className="min-w-full flex flex-row flex-wrap items-center justify-evenly gap-4 p-4">
            <div className="flex flex-col items-center">
                <span className="md:text-sm text-xs">Holders</span>
                <span className="md:text-3xl text-xl">
                    {isLoading ? (
                        <RingsLoader className="stroke-black w-6 h-6" />
                    ) : (
                        holderData?.totalHolders
                    )}
                </span>
            </div>
            <div className="flex flex-col md:items-start items-center">
                <span className="md:text-sm text-xs text-nowrap">
                    Volume (24hrs)
                </span>
                <span className="md:text-3xl text-xl">
                    $
                    {(
                        (parseInt(volumeData || "0") / LAMPORTS_PER_SOL) *
                        solanaPrice
                    ).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                    })}
                </span>
            </div>
            <div className="flex flex-col md:items-start items-end">
                <span className="md:text-sm text-xs">Current Mkt Cap</span>
                <span className="md:text-3xl text-xl">
                    $
                    {(marketCap * solanaPrice).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                    })}
                </span>
            </div>
            <div className="flex flex-col items-start">
                <span className="md:text-sm text-xs">Liquidity</span>
                <span className="md:text-3xl text-xl">
                    {(reserveSupply || 0).toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                    })}{" "}
                    SOL
                </span>
            </div>
            {stats?.tokenInfo?.sell_fee?.gt(new BN(0)) && (
                <div className="flex flex-col items-center justify-center">
                    <span className="md:text-sm text-xs">Jeet Tears</span>
                    <span className="md:text-3xl text-xl">
                        {stats.curveInfo.jeetInCurve.uiAmount}
                        <span className="md:text-sm text-xs">sol</span>
                    </span>
                </div>
            )}
        </div>
    );
}

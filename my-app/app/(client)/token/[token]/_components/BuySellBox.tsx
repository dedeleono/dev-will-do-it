"use client";

import useTokenStore from "@/components/store/useTokenStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/common";
import { BN } from "@coral-xyz/anchor";
import {
    createCloseAccountInstruction,
    getAssociatedTokenAddressSync,
    NATIVE_MINT,
} from "@solana/spl-token";
import { useAnchorWallet, AnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    getBuyInstructions,
    getSellInstructions,
} from "@/app/(client)/token/[token]/_utils/getAccounts";
import { PLATFORM_FEE_RECEIVER } from "@/solana/contracts/config";
import { waitForTransaction } from "@/solana/waitForTransaction";
import { RingsLoader } from "@/components/shared/Loaders";
import { trpc } from "@/app/_trpc/client";
import WalletMultiButtonStyled from "@/components/ui/walletBtn";
import { getReserveOut, getTokensOut } from "@/utils/curveMath";

export default function BuySellBox() {
    const wallet = useAnchorWallet();
    const [buyAmount, setBuyAmount] = useState(0.0);
    const [sellAmount, setSellAmount] = useState(0.0);
    const [buyLoading, setBuyLoading] = useState(false);
    const [sellLoading, setSellLoading] = useState(false);

    const { balances, stats, meta, program } = useTokenStore((state) => ({
        balances: state.balances,
        stats: state.stats,
        meta: state.tokenMeta,
        program: state.program,
    }));

    //---------------------------------------------------------------------------
    //          Mutations
    //---------------------------------------------------------------------------
    const { mutate: addTx } = trpc.createTx.useMutation();

    //---------------------------------------------------------------------------
    //          Vesting State
    //---------------------------------------------------------------------------
    const isNativeMint =
        stats.curveInfo?.reserveMint.toBase58() === NATIVE_MINT.toBase58();
    const isVested = stats.tokenInfo?.vesting_basis.gt(new BN(0));
    //---------------------------------------------------------------------------
    //          Balances
    //---------------------------------------------------------------------------
    const buyBalance = isNativeMint
        ? ((balances.nativeBalance || 0) +
              parseInt(balances.reserveBalance?.amount || "0")) /
          10 ** 9
        : balances.reserveBalance?.uiAmount || 0;
    const sellBalance = isVested
        ? balances.placeholderBalance?.uiAmount || 0
        : balances.tokenBalance?.uiAmount || 0;
    //---------------------------------------------------------------------------
    //          ERROR Calculations
    //---------------------------------------------------------------------------
    const buyAmountErrors = useMemo(() => {
        if (buyAmount > buyBalance) return "Amount is greater than balance";
        return "";
    }, [buyAmount, buyBalance]);

    const sellAmountErrors = useMemo(() => {
        if (sellAmount > sellBalance) return "Amount is greater than balance";
        return "";
    }, [sellAmount, sellBalance]);

    //---------------------------------------------------------------------------
    //          Buy/Sell Handlers
    //---------------------------------------------------------------------------
    const buy = async () => {
        if (!program || !program.provider.publicKey) return;
        setBuyLoading(true);

        // check if placeholder account and user curve are created, if not create instructions here
        const ix = await getBuyInstructions(
            program.provider.connection,
            stats.curveInfo.placeholderMint,
            stats.curveInfo.tokenMint,
            stats.curveInfo.reserveMint,
            program.provider.publicKey,
            buyAmount
        );

        const tx = await program.methods
            .buyOrSell(new BN(buyAmount * 10 ** 9), true)
            .accountsPartial({
                curveToken: stats.curveInfo.tokenMint,
                reserveToken: stats.curveInfo.reserveMint,
                protocolFeeReceiver: PLATFORM_FEE_RECEIVER,
                referralReserveAccount: null,
            })
            .preInstructions(ix.preInstructions)
            .postInstructions(ix.postInstructions)
            .rpc({
                skipPreflight: true,
            })
            .catch((e) => {
                console.log("Buy Error", e);
                return null;
            });
        if (!tx) {
            setBuyLoading(false);
            return;
        }
        console.log("Buy TX", tx);
        // Wait for 5 seconds before checking the transaction
        await new Promise((resolve) => setTimeout(resolve, 5000));

        await waitForTransaction(program.provider.connection, tx);

        // Wait for another 5 seconds after the transaction is confirmed
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // then update database
        const wallet = program.provider.publicKey?.toBase58();
        console.log("adding TX here");
        await addTx(
            {
                type: "buy",
                wallet: wallet,
                tx: tx,
                token: stats.curveInfo.tokenMint.toBase58(),
            },
            {
                onSuccess: (okData) => {
                    console.log(okData);
                },
                onSettled: () => {
                    setBuyLoading(false);
                },
            }
        );
    };
    const sell = async () => {
        if (!program || !program.provider.publicKey) return;
        setSellLoading(true);

        const ix = await getSellInstructions(
            program.provider.connection,
            stats.curveInfo.reserveMint,
            program.provider.publicKey
        );
        let sellValue: BN;
        try {
            sellValue = new BN(sellAmount).mul(new BN("1000000000"));
        } catch (e) {
            console.log(e);
            setSellLoading(false);
            return;
        }

        const tx = await program.methods
            .buyOrSell(sellValue, false)
            .accountsPartial({
                curveToken: stats.curveInfo.tokenMint,
                reserveToken: stats.curveInfo.reserveMint,
                protocolFeeReceiver: PLATFORM_FEE_RECEIVER,
                referralReserveAccount: null,
            })
            .preInstructions(ix.preInstructions)
            .postInstructions(ix.postInstructions)
            .rpc({
                skipPreflight: true,
            })
            .catch((e) => {
                console.log("Sell Error", e);
                return null;
            });
        if (!tx) {
            setSellLoading(false);
            return;
        }

        console.log("Sell TX", tx);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await waitForTransaction(program.provider.connection, tx);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const wallet = program.provider.publicKey?.toBase58();
        await addTx(
            {
                type: "sell",
                wallet: wallet,
                tx: tx,
                token: stats.curveInfo.tokenMint.toBase58(),
            },
            {
                onSuccess: (okData) => {
                    console.log(okData);
                },
                onSettled: () => {
                    setSellLoading(false);
                },
            }
        );
    };

    //---------------------------------------------------------------------------
    //          Render
    //---------------------------------------------------------------------------
    return (
        <div className="min-w-[100%]">
            <div>
                <div className="bg-black text-white min-w-[100%] text-xs py-2 rounded-lg pointer-events-none text-center whitespace-pre-wrap">
                    Trading on{"\n"}
                    <span className="text-xs text-primary">DevWillDoIt</span>
                </div>
                <div className="w-full border-black px-7 py-5 border-[3px] rounded-lg mt-2">
                    <Tabs
                        defaultValue="buy"
                        className="min-w-full "
                        id="tradeTabs"
                    >
                        <TabsList className="grid w-full grid-cols-2 bg-background">
                            <TabsTrigger
                                value={"buy"}
                                activeBackgroundColor="main"
                                className={`h-full rounded-r-none border-r-[1px] border-r-black`}
                                onClick={() => {
                                    setBuyAmount(0);
                                    setSellAmount(0);
                                }}
                                disabled={buyLoading || sellLoading}
                            >
                                Buy
                            </TabsTrigger>
                            <TabsTrigger
                                value={"sell"}
                                activeBackgroundColor="pink"
                                className={`h-full rounded-l-none border-l-[1px] border-l-black`}
                                onClick={() => {
                                    setBuyAmount(0);
                                    setSellAmount(0);
                                }}
                                disabled={buyLoading || sellLoading}
                            >
                                Sell
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="buy" className="size-full">
                            <Card className="bg-background !shadow-none border-none !p-0 !mx-0">
                                <CardContent className="space-y-2 !p-0 !mx-0  font-bold">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="buyQ"
                                            className="text-xs font-bold"
                                        >
                                            Bal:{" "}
                                            <span>
                                                {buyBalance?.toLocaleString(
                                                    undefined,
                                                    {
                                                        minimumFractionDigits: 4,
                                                    }
                                                )}
                                                &nbsp;SOL
                                            </span>
                                        </Label>
                                        <Input
                                            id="buyQ"
                                            className={cn(
                                                "py-2 font-bold",
                                                buyAmount > buyBalance
                                                    ? "border-red-500"
                                                    : ""
                                            )}
                                            type="number"
                                            value={buyAmount}
                                            onChange={(e) => {
                                                const val = parseFloat(
                                                    e.target.value
                                                );
                                                if (isNaN(val)) setBuyAmount(0);
                                                else setBuyAmount(val);
                                            }}
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <div className="text-xs text-gray-500">
                                            To Buy:{" "}
                                            {getTokensOut(
                                                buyAmount || 0,
                                                parseFloat(
                                                    stats.curveInfo?.tokensSold.toString() ||
                                                        "0"
                                                ) / 1e9,
                                                stats.tokenInfo
                                                    ?.slope_numerator,
                                                stats.tokenInfo
                                                    ?.slope_denominator
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 4,
                                            })}
                                        </div>
                                    </div>
                                    <div className="w-full flex flex-row flex-nowrap items-center justify-between">
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background border-none text-[10px] cursor-pointer min-h-6"
                                            onClick={() => {
                                                setBuyAmount(buyBalance);
                                            }}
                                        >
                                            Max
                                        </Badge>
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background border-none text-xs text-nowrap text-[10px] cursor-pointer h-6"
                                            onClick={() => {
                                                setBuyAmount(1);
                                            }}
                                        >
                                            1 SOL
                                        </Badge>
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background border-none text-xs text-nowrap text-[10px] cursor-pointer h-6"
                                            onClick={() => {
                                                setBuyAmount(5);
                                            }}
                                        >
                                            5 SOL
                                        </Badge>
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background border-none text-xs text-nowrap text-[10px] cursor-pointer h-6"
                                            onClick={() => {
                                                setBuyAmount(10);
                                            }}
                                        >
                                            10 SOL
                                        </Badge>
                                    </div>
                                    {buyAmountErrors && (
                                        <div className="text-red-500 text-xs text-center ">
                                            {buyAmountErrors}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="!p-0 !mx-0">
                                    {wallet && (
                                        <Button
                                            variant="default"
                                            className="w-full bg-main text-text dark:bg-darkBg dark:text-darkTex mt-5"
                                            disabled={
                                                !!buyAmountErrors ||
                                                buyLoading ||
                                                sellLoading
                                            }
                                            onClick={() => {
                                                buy();
                                            }}
                                        >
                                            {buyLoading ? (
                                                <RingsLoader className="stroke-black" />
                                            ) : (
                                                "Buy"
                                            )}
                                        </Button>
                                    )}
                                    {!wallet && (
                                        <WalletMultiButtonStyled className="bg-transparent w-full  min-h-[3.8rem] mt-5 flex justify-center items-center" />
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="sell" className="size-full">
                            <Card className="bg-background !shadow-none border-none !p-0 !mx-0">
                                <CardContent className="space-y-2 !p-0 !mx-0">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="sellQ"
                                            className="text-xs"
                                        >
                                            Bal:{" "}
                                            <span>
                                                {sellBalance.toLocaleString(
                                                    undefined,
                                                    {
                                                        minimumFractionDigits: 4,
                                                    }
                                                )}
                                            </span>
                                            &nbsp;
                                            {meta.symbol}
                                            {isVested ? " (vested)" : ""}
                                        </Label>
                                        <Input
                                            id="sellQ"
                                            type="number"
                                            value={sellAmount}
                                            onChange={(e) => {
                                                const val = parseFloat(
                                                    e.target.value
                                                );
                                                console.log(val);
                                                if (isNaN(val))
                                                    setSellAmount(0);
                                                else setSellAmount(val);
                                            }}
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <div className="text-xs text-gray-500">
                                            Approx SOL:{" "}
                                            {getReserveOut(
                                                sellAmount || 0,
                                                parseFloat(
                                                    stats.curveInfo?.tokensSold.toString() ||
                                                        "0"
                                                ) / 1e9,
                                                stats.tokenInfo
                                                    ?.slope_numerator,
                                                stats.tokenInfo
                                                    ?.slope_denominator
                                            ).toLocaleString(undefined, {
                                                minimumFractionDigits: 4,
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex flex-row flex-nowrap justify-between w-full">
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background py-1 border none text-[10px] h-6 cursor-pointer"
                                            onClick={() => {
                                                setSellAmount(sellBalance / 4);
                                            }}
                                        >
                                            25%
                                        </Badge>
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background border none text-xs text-nowrap text-[10px] h-6 cursor-pointer"
                                            onClick={() => {
                                                setSellAmount(sellBalance / 2);
                                            }}
                                        >
                                            50%
                                        </Badge>
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background border none text-xs text-nowrap text-[10px] h-6 cursor-pointer"
                                            onClick={() => {
                                                setSellAmount(() => {
                                                    const res = sellBalance / 4;
                                                    const sum = res * 3;
                                                    return sum;
                                                });
                                            }}
                                        >
                                            75%
                                        </Badge>
                                        <Badge
                                            variant={"neutral"}
                                            className="bg-foreground text-background border none text-xs text-nowrap text-[10px] h-6 cursor-pointer "
                                            onClick={() => {
                                                setSellAmount(sellBalance);
                                            }}
                                        >
                                            Max
                                        </Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="!p-0 !mx-0">
                                    {wallet && (
                                        <Button
                                            disabled={
                                                !!sellAmountErrors ||
                                                sellLoading ||
                                                buyLoading
                                            }
                                            onClick={() => {
                                                sell();
                                            }}
                                            variant="default"
                                            className="w-full bg-[#FD29F0] text-text dark:bg-darkBg dark:text-darkText mt-5"
                                        >
                                            {sellLoading ? (
                                                <RingsLoader className="stroke-black" />
                                            ) : (
                                                "Sell"
                                            )}
                                        </Button>
                                    )}
                                    {!wallet && (
                                        <WalletMultiButtonStyled className="bg-transparent w-full  min-h-[3.8rem] mt-5 flex justify-center items-center" />
                                    )}
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

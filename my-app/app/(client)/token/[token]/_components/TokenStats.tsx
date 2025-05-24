"use client";

import { formatAmount } from "@/components/shared/LatestBuysRows";
import useTokenStore from "@/components/store/useTokenStore";
import { Progress } from "@/components/ui/progress";
import { getPrice } from "@/utils/curveMath";
import { BN } from "@coral-xyz/anchor";
import React from "react";

export default function TokenStats() {
    const { stats, solPrice } = useTokenStore((state) => ({
        stats: state.stats,
        solPrice: state.solanaPrice,
    }));
    const isVested = stats.tokenInfo?.vesting_basis.gt(new BN(0));
    const hasAntiWhale = stats.tokenInfo?.max_tx_tokens.gt(new BN(0));
    const tokensSold = stats.curveInfo?.tokensSold || new BN(0);
    const reserveInCurve = stats.curveInfo?.reserveInCurve || new BN(0);
    const supplyGoal = stats.tokenInfo?.liquidity_supply;
    const curveProgress =
        ((reserveInCurve.uiAmount || 0) /
            (parseFloat((supplyGoal || 1).toString()) / 1e9)) *
        100;
    const goalMarketCap = stats.tokenInfo
        ? getPrice(
              800_000_000,
              stats.tokenInfo?.slope_numerator || 0,
              stats.tokenInfo?.slope_denominator || 0
          ) * 1_000_000_000
        : 0;
    return (
        <React.Fragment>
            <div className="w-full border-none my-4">
                <div className="flex flex-row min-w-full justify-between border-b-2 border-black py-3">
                    <span className="text-sm">vested</span>
                    <span className="text-sm uppercase font-work">
                        {!!isVested ? "Yes" : "No"}
                    </span>
                </div>

                <div className="flex flex-row min-w-full justify-between border-b-2 border-black py-3">
                    <span className="text-sm">Anti-Whale</span>
                    <span className="text-sm uppercase font-work">
                        {!!hasAntiWhale
                            ? `Max TX: ${formatAmount(
                                  stats.tokenInfo?.max_tx_tokens.toString(),
                                  true
                              )}`
                            : "No"}
                    </span>
                </div>

                <div className="flex flex-row min-w-full justify-between border-b-2 border-black py-3">
                    <span className="text-sm">KYC</span>
                    <span className="text-sm uppercase font-work">Yes</span>
                </div>

                <div className="flex flex-row min-w-full max-w-full justify-between border-black py-3">
                    <span className="text-sm text-nowrap mr-2">
                        Project Wallet
                    </span>
                    <span className="text-sm uppercase font-work text-wrap italic">
                        {stats.owner
                            ? `${stats.owner
                                  .toString()
                                  .slice(0, 5)}...${stats.owner
                                  .toString()
                                  .slice(-5)}`
                            : ""}
                    </span>
                </div>
            </div>
            <div className="w-full border-none">
                <div className="min-w-full">
                    <div className="flex flex-row w-full justify-between px-1">
                        <span className="text-sm">Bonding Curve Progress</span>
                        <span className="text-sm">
                            {curveProgress.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                            })}
                            %
                        </span>
                    </div>
                    <Progress
                        color="#000000"
                        value={curveProgress}
                        className="w-full bg-gray-300 rounded-full h-2"
                    />
                </div>
                <div className="min-w-full p-1 font-work text-xs flex flex-col my-4 whitespace-pre-wrap">
                    <span className="pb-2">
                        when the market cap reaches&nbsp;
                        <strong>
                            $
                            {(goalMarketCap * solPrice).toLocaleString(
                                undefined,
                                {
                                    maximumFractionDigits: 2,
                                }
                            )}
                        </strong>
                        .{"\n"}All the liquidity from the bonding curve will be
                        deposited into Raydium and burned. Progression increases
                        as the price goes up.
                    </span>
                    <span className="pt-2">
                        there are&nbsp;
                        <strong>
                            {(
                                800_000_000 -
                                parseFloat(tokensSold.toString()) / 1e9
                            ).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                            })}
                        </strong>
                        &nbsp;tokens still available for sale in the bonding
                        curve and there is&nbsp;
                        <strong>{reserveInCurve.uiAmount || 0} SOL</strong> in
                        the bonding curve.
                    </span>
                </div>
                <div className="min-w-full">
                    <div className="flex flex-row w-full justify-between px-1">
                        <span className="text-sm">Top Dev Progress</span>
                        <span className="text-sm">95%</span>
                    </div>
                    <Progress
                        color="#000000"
                        value={95}
                        className="w-full bg-gray-300 rounded-full h-2"
                    />
                    <div className="flex flex-row w-full pl-1 pt-2">
                        <span className="text-[0.7rem]">
                            Become the top dev at $33,986 market cap
                        </span>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

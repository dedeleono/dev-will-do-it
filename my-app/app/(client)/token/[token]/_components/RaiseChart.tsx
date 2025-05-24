"use client";
import { useState, useLayoutEffect, useRef, useEffect, useMemo } from "react";
import { CandlestickData, ColorType, createChart } from "lightweight-charts";
import { trpc } from "@/app/_trpc/client";
import useTokenStore from "@/components/store/useTokenStore";

function RaiseChart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);
    const stats = useTokenStore((state) => state.stats);
    const { data: tradesData } = trpc.getRaiseChartData.useQuery(
        stats.curveInfo?.tokenMint.toBase58() || "",
        {
            enabled: !!stats.curveInfo?.tokenMint,
            refetchInterval: 2_000,
        }
    );

    const parsedTrades = useMemo(() => {
        if (!tradesData || tradesData.length === 0) return [];
        const initialA = stats.tokenInfo.slope_numerator;

        // Sort the data before processing
        const sortedTradesData = [...tradesData].sort(
            (a, b) =>
                new Date(a.time as string).getTime() -
                new Date(b.time as string).getTime()
        );

        return sortedTradesData.reduce(
            (acc: CandlestickData[], trade, index) => {
                const tradeTime = new Date(trade.time as string).getTime();
                const intervalTime =
                    Math.floor(tradeTime / (5 * 60 * 1000)) * (5 * 60);
                const tradePrice = Number(trade.end_price) / 1e18;

                const existingInterval = acc.find(
                    (item) => (item.time as number) === intervalTime
                );

                if (existingInterval) {
                    existingInterval.high = Math.max(
                        existingInterval.high,
                        tradePrice
                    );
                    existingInterval.low = Math.min(
                        existingInterval.low,
                        tradePrice
                    );
                    existingInterval.close = tradePrice;
                } else {
                    // If there's a gap larger than 5 minutes, fill it with the last known close price
                    if (acc.length > 0) {
                        const lastInterval = acc[acc.length - 1];
                        const timeDiff =
                            intervalTime - (lastInterval.time as number);
                        if (timeDiff > 5 * 60) {
                            for (
                                let t = (lastInterval.time as number) + 5 * 60;
                                t < intervalTime;
                                t += 5 * 60
                            ) {
                                acc.push({
                                    time: t as any,
                                    open: lastInterval.close,
                                    high: lastInterval.close,
                                    low: lastInterval.close,
                                    close: lastInterval.close,
                                });
                            }
                        }
                    }

                    const newInterval = {
                        time: intervalTime as any,
                        open:
                            acc.length > 0
                                ? acc[acc.length - 1].close
                                : tradePrice,
                        high: tradePrice,
                        low: tradePrice,
                        close: tradePrice,
                    };

                    // For the first interval, add the initial 'a' value
                    if (acc.length === 0) {
                        newInterval.open = initialA;
                        newInterval.low = Math.min(initialA, tradePrice);
                    }

                    acc.push(newInterval);
                }

                return acc;
            },
            []
        );
    }, [tradesData, stats?.tokenInfo?.slope_numerator]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: "#21253E" },
                textColor: "#fff",
            },
            grid: {
                vertLines: { color: "#444" },
                horzLines: { color: "#444" },
            },
            width: chartContainerRef.current.clientWidth,
            height: 450,
            timeScale: { timeVisible: true },
            localization: {
                priceFormatter: (price: number) => {
                    return `$${price.toFixed(11)}`;
                },
            },
        });

        chart.timeScale().applyOptions({ borderColor: "#71649C" });
        chart.timeScale().fitContent();

        const newSeries = chart.addCandlestickSeries();
        newSeries.setData(parsedTrades);

        chartRef.current = chart; // Store the chart instance in the ref

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
                chartRef.current.timeScale().fitContent(); // Optionally adjust the visible range
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
        };
    }, [parsedTrades]);

    useEffect(() => {
        // Force resize the chart when the parent component's size changes
        if (chartRef.current) {
            chartRef.current.applyOptions({
                width: chartContainerRef.current?.clientWidth || 0,
            });
            chartRef.current.timeScale().fitContent();
        }
    });

    return (
        <div className="min-h-[450px] transition-all duration-300 ease-in-out w-full p-[10px] bg-[#21253E] rounded-xl">
            <div
                className="min-h-[450px] transition-all duration-300 ease-in-out"
                ref={chartContainerRef}
            />
        </div>
    );
}

export default RaiseChart;

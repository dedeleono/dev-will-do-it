"use client";
import { FC, forwardRef, useState } from "react";
import { useAnimate } from "framer-motion";
import RaiseChart from "./RaiseChart";
import { placeholder } from "@/public/imgs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import React from "react";

const AnimatedSharedLayout = forwardRef(function ASL(props, ref) {
    const [scope, animate] = useAnimate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [chartWidth, setChartWidth] = useState("100%"); // State to track chart width

    const handleAnimate = async () => {
        if (!isExpanded) {
            await animate(
                "#raiseChart_div",
                { width: "50%" },
                {
                    duration: 0.5,
                    ease: [0.42, 0, 0.58, 1],
                    onUpdate: (latest) => {
                        setChartWidth(latest.width); // Update chart width during animation
                    },
                }
            );
            await animate(
                "#liveStream_div",
                { width: "50%", opacity: 1 },
                {
                    duration: 0.5,
                    ease: [0.42, 0, 0.58, 1],
                    onUpdate: (latest) => {
                        setChartWidth("50%"); // Ensure chart width is set correctly
                    },
                }
            );
            setIsExpanded(true);
        } else {
            await animate(
                "#raiseChart_div",
                { width: "100%" },
                {
                    duration: 0.5,
                    ease: [0.42, 0, 0.58, 1],
                    onUpdate: (latest) => {
                        setChartWidth(latest.width); // Update chart width during animation
                    },
                }
            );
            await animate(
                "#liveStream_div",
                { width: "0%", opacity: 0 },
                {
                    duration: 0.5,
                    ease: [0.42, 0, 0.58, 1],
                    onUpdate: (latest) => {
                        setChartWidth("100%"); // Ensure chart width is set correctly
                    },
                }
            );
            setIsExpanded(false);
        }
    };

    React.useImperativeHandle(ref, () => ({
        handleAnimate,
    }));

    return (
        <>
            <div ref={scope} className="flex w-full">
                <div
                    id="raiseChart_div"
                    className="flex-grow"
                    style={{ width: chartWidth }}
                >
                    <RaiseChart />
                </div>
                <div
                    id="liveStream_div"
                    className="flex-grow opacity-0"
                    style={{ width: "0%" }}
                >
                    <Image
                        src={placeholder.src}
                        width={100}
                        height={100}
                        alt="cup"
                        className="w-full h-full"
                    />
                </div>
            </div>
        </>
    );
});

export default AnimatedSharedLayout;

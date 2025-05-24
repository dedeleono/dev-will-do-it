"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "../ui/card";
import Image from "next/image";
import { completion, cup, placeholder } from "@/public/imgs";
import FillBar from "@/components/FillBar";

const CARD_COLORS = ["#266678", "#cb7c7a"];
const CARD_OFFSET = 10;
const SCALE_FACTOR = 0.025;

//TODO; change colors by actual cards to swap them automatically when we get data from DB

const cardStyle: React.CSSProperties = {
    position: "absolute",
    height: "220px",
    borderRadius: "8px",
    transformOrigin: "top center",
    listStyle: "none",
};

const CardStack = () => {
    const [cards, setCards] = React.useState(CARD_COLORS);

    const moveItem = (array: string[], from: number, to: number) => {
        const newArray = [...array];
        const item = newArray.splice(from, 1)[0];
        newArray.splice(to, 0, item);
        return newArray;
    };

    const moveToEnd = (from: number) => {
        setCards((currentCards) =>
            moveItem(currentCards, from, currentCards.length - 1)
        );
    };

    return (
        <div className="flex items-center justify-center size-full">
            <ul className="relative size-full">
                {cards.map((color, index) => {
                    const canDrag = index === 0;

                    return (
                        <motion.li
                            key={color}
                            style={{
                                ...cardStyle,

                                cursor: canDrag ? "grab" : "auto",
                            }}
                            className="w-full h-full md:min-h-[325px] min-h-[700px]"
                            animate={{
                                top: index * -CARD_OFFSET,
                                scale: 1 - index * SCALE_FACTOR,
                                zIndex: CARD_COLORS.length - index,
                            }}
                            drag={canDrag ? "y" : false}
                            dragConstraints={{
                                top: 0,
                                bottom: 0,
                            }}
                            onDragEnd={() => moveToEnd(index)}
                        >
                            <Card
                                className={`w-full h-full !shadow-none rounded-b-none rounded-t-lg ${
                                    index === 0 ? "bg-white" : "bg-main "
                                }`}
                            >
                                <CardContent className="w-full h-full md:grid md:grid-cols-3 flex flex-col p-3 gap-3">
                                    <div className="col-span-1 flex relative size-full items-center">
                                        <Image
                                            alt="devImg"
                                            src={placeholder.src}
                                            width={100}
                                            height={100}
                                            className="rounded-md absolute object-cover md:h-full md:w-[85%] w-full h-full top-0"
                                        />
                                    </div>

                                    <div className="col-span-1 flex flex-col size-full justify-start py-3">
                                        <div className="size-full flex flex-row md:flex-nowrap items-start flex-wrap justify-between py-2 sm:mt-0 mt-6">
                                            <div className="flex flex-col md:w-full w-1/2">
                                                <label className="text-nowrap font-work font-extralight text-xs">
                                                    Position #0001
                                                </label>
                                                <h2 className="font-talk">
                                                    NAME
                                                </h2>
                                            </div>
                                            <div className="flex flex-col md:w-full w-1/2">
                                                <label className="text-nowrap font-work font-extralight text-xs">
                                                    Ticker
                                                </label>
                                                <h2 className="font-talk">
                                                    NAME
                                                </h2>
                                            </div>
                                            <div className="flex flex-col w-full ">
                                                <label className="text-nowrap font-work font-extralight text-xs">
                                                    Created by:
                                                </label>
                                                <h2 className="font-talk">
                                                    NAME
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="size-full font-work flex flex-col">
                                            <h2 className="text-nowrap font-semibold md:text-xl text-xs">
                                                About
                                            </h2>
                                            <span className="md:text-[0.85rem] text-sm">
                                                Lorem ipsum dolor sit amet
                                                consectetur, adipisicing elit.
                                                Iure explicabo exercitationem
                                                autem optio distinctio hic
                                                facere saepe mollitia, nam
                                                sapiente dignissimos iste odit
                                                rem temporibus ducimus quasi
                                                maxime ipsa dolorum!
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full min-w-full flex md:flex-col flex-row-reverse items-center md:justify-center justify-between">
                                        <figure className="flex relative size-full items-center w-full">
                                            <Image
                                                alt="devImg"
                                                src={cup.src}
                                                width={400}
                                                height={400}
                                                className="rounded-md absolute object-contain md:size-full size-20 right-0"
                                            />
                                        </figure>

                                        <div className="flex size-full items-center flex-row w-full">
                                            <div className="flex flex-col w-full items-center ml-5">
                                                <span className="font-talk text-sm text-nowrap pb-5 w-full text-left pl-3">
                                                    Completion %
                                                </span>
                                                <div className="flex flex-row items-center h-[70px]">
                                                    <FillBar
                                                        percentage={50}
                                                        className="w-[180px]"
                                                    />
                                                    <span className="flex font-talk text-xs -ml-6">
                                                        100%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.li>
                    );
                })}
            </ul>
        </div>
    );
};

export default CardStack;

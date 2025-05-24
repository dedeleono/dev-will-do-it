"use client";

import React, { FC } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { completion, placeholder } from "@/public/imgs";
import { Card } from "../ui/card";
import FillBar from "@/components/FillBar";
import Link from "next/link";

interface CardProps {
    id: string; // Converted to string from Int
    img: string; // img_url
    title: string; // token_name
    ticker: string;
    holders: number;
    creator: string;
    date: Date | null; // For any date-related fields (e.g., created_at, updated_at)
    className: string;
    mint: string;
}

const TokenCard: FC<CardProps> = ({
    img,
    title,
    ticker,
    creator,
    id,
    className,
    holders,
    mint,
}) => {
    return (
        <Link href={`/token/${mint}`}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.9 }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                    duration: 0.2,
                }}
                className="cursor-pointer rounded-md"
            >
                <Card id={id} className={className}>
                    <Image
                        alt="Token image"
                        className="object-cover min-h-[230px] max-h-[230px] w-full rounded-lg shadow-md border-2 border-black"
                        src={img || placeholder}
                        width={250}
                        height={250}
                    />

                    <div className="flex flex-col size-full pl-2 gap-2">
                        <span className="">{title}</span>
                        <span className="">
                            <span className="text-xs">Ticker:</span> ${ticker}
                        </span>
                        <span className="text-xs pt-1 items-center">
                            By:
                            <span className="pl-1 underline underline-offset-1 text-[#1a3fba]">
                                @{creator || "ANON"}
                            </span>
                        </span>
                        <div className="size-full flex flex-row justify-between pt-2">
                            <div className="flex flex-col col-span-1 size-full ">
                                <span className="font-work text-xs">
                                    holders{" "}
                                </span>
                                <span className="flex">{holders}</span>
                            </div>
                            <div className="flex flex-col col-span-1 size-full">
                                <span className="font-work text-xs">
                                    volume
                                </span>
                                <span className="flex">25</span>
                            </div>
                            <div className="flex flex-col col-span-1 size-full">
                                <span className="font-work text-xs">likes</span>
                                <span className="flex">25</span>
                            </div>
                        </div>
                        <div className="">
                            <span className="text-xs font-work items-center md:justify-center flex flex-row text-nowrap w-full md:pb-6 pb-3 md:mt-0 mt-3">
                                completion %
                                <FillBar
                                    percentage={50}
                                    className="md:w-[100px] w-[75px]"
                                />
                            </span>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </Link>
    );
};

export default TokenCard;

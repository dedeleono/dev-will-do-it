"use client";

import { FC } from "react";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import LatestBuyRows from "./shared/LatestBuysRows";
import LatestSellRows from "./shared/LatestSellsRows";
import LatestChatRows from "./shared/LatestChatRows";
import { Happy, Sad, Texting } from "@/public/imgs";

//@todo Integrate with actual data from DB and Dynamic component to move Table Rows

const DynamicTables: FC = () => {
    return (
        <div className="size-full grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 md:gap-5 gap-12 mt-32">
            {/* LATEST BUYS TABLE */}

            <Table
                className="col-span-1 size-full rounded-md border-2 border-black"
                style={{ borderCollapse: "separate" }}
            >
                <TableHeader className="">
                    <TableRow
                        className=""
                        style={{
                            backgroundImage:
                                " linear-gradient(to right, #00FDA0, yellow)",
                        }}
                    >
                        <TableHead
                            className="size-full py-6 text-lg flex flex-row justify-between items-center"
                            colSpan={3}
                        >
                            <div className="flex flex-row justify-between items-center w-full">
                                <span className="flex text-nowrap text-black">
                                    Latest Buys
                                </span>
                                <Image
                                    src={Happy}
                                    alt="happy"
                                    width={100}
                                    height={100}
                                    className="object-contain absolute -top-8 right-0 scale-150"
                                />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="rounded-b-lg">
                    <LatestBuyRows />
                </TableBody>
            </Table>

            {/* LATEST SELLS TABLE */}

            <Table
                className="col-span-1 size-full rounded-md border-2 border-black"
                style={{ borderCollapse: "separate" }}
            >
                <TableHeader>
                    <TableRow
                        className=""
                        style={{
                            backgroundImage:
                                " linear-gradient(to right, yellow, orange, red, #ff047e)",
                        }}
                    >
                        <TableHead
                            className="size-full py-6 text-lg flex flex-row justify-between items-center relative overflow-visible"
                            colSpan={3}
                        >
                            <div className="flex flex-row justify-between items-center w-full">
                                <span className="flex text-nowrap text-black">
                                    Latest Comments
                                </span>
                                <Image
                                    src={Texting}
                                    alt="texting"
                                    width={100}
                                    height={100}
                                    className="object-contain absolute -top-8 right-0 scale-150"
                                />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="rounded-b-lg">
                    <LatestChatRows />
                </TableBody>
            </Table>

            {/* LATEST COMMENTS TABLE */}

            <Table
                className="col-span-1 size-full rounded-md border-2 border-black"
                style={{ borderCollapse: "separate" }}
            >
                <TableHeader className="">
                    <TableRow
                        className=""
                        style={{
                            backgroundImage:
                                " linear-gradient(to right, #ff047e, red, orange, yellow)",
                        }}
                    >
                        <TableHead
                            className="size-full py-6 text-lg flex flex-row justify-between items-center relative overflow-visible"
                            colSpan={3}
                        >
                            <div className="flex flex-row justify-between items-center w-full">
                                <span className="flex text-nowrap text-black">
                                    Latest Sales
                                </span>
                                <Image
                                    src={Sad}
                                    alt="sad"
                                    width={100}
                                    height={100}
                                    className="object-contain absolute -top-8 -right-2 scale-150"
                                />
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="rounded-b-lg">
                    <LatestSellRows />
                </TableBody>
            </Table>
        </div>
    );
};

export default DynamicTables;

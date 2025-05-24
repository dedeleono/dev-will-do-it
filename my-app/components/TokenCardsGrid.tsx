"use client";

import React, { FC, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { motion } from "framer-motion";
import Card from "@/components/shared/Card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationLink,
    PaginationEllipsis,
    PaginationNext,
} from "@/components/ui/pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { LuFilter } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { IoCheckmarkOutline } from "react-icons/io5";
import { Loader2Icon } from "lucide-react";
import { redirect } from "next/navigation";

const TokenCardsGrid: FC = ({}) => {
    const itemsPerPage = 6; // Number of cards per page
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError } = trpc.getAllRaises.useQuery({
        page: currentPage,
        itemsPerPage,
    });

    console.log(data);

    const tokens = Array.isArray(data?.raises) ? data.raises : [];
    const totalRaises = data?.totalRaises || 0;

    const totalPages = Math.ceil(totalRaises / itemsPerPage);

    //   const currentTokens = tokens.slice(
    //     (currentPage - 1) * itemsPerPage,
    //     currentPage * itemsPerPage
    //   );

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        let startPage = Math.max(currentPage - 1, 1);
        let endPage = Math.min(currentPage + 1, totalPages);
        if (currentPage - 1 > 1) {
            pageNumbers.push(1, "...");
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        if (currentPage + 1 < totalPages) {
            pageNumbers.push("...", totalPages);
        }
        return pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
                {typeof page === "number" ? (
                    <PaginationLink
                        size={"icon"}
                        className={`px-3 py-2 rounded-md transition-colors cursor-pointer ${
                            page === currentPage
                                ? "cursor-pointer bg-primary"
                                : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={() => handlePageChange(page)}
                    >
                        {page}
                    </PaginationLink>
                ) : (
                    <span className="px-3 py-2 text-muted-foreground">
                        {page}
                    </span>
                )}
            </PaginationItem>
        ));
    };

    return (
        <div className="mt-20 mb-10 size-full">
            <h2 className="text-3xl">Live Sales</h2>
            <div className="size-full flex flex-row">
                <div className="size-full">
                    <div className="min-w-full size-full flex md:flex-row flex-col-reverse mt-8 mb-20 justify-between">
                        <div className="flex flex-row col-span-1 space-x-7">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size={null}
                                        className="bg-background px-6 py-2 text-base"
                                    >
                                        Sort{" "}
                                        <LuFilter className="ml-3 text-lg" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-fit text-xs font-talk">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className="">
                                            <RadioGroup defaultValue="default">
                                                <div className="flex items-center space-x-2 border-none">
                                                    <RadioGroupItem
                                                        value="default"
                                                        id="r1"
                                                    />
                                                    <Label htmlFor="r1">
                                                        Nearest to Completion
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="comfortable"
                                                        id="r2"
                                                    />
                                                    <Label htmlFor="r2">
                                                        Age
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem
                                                        value="compact"
                                                        id="r3"
                                                    />
                                                    <Label htmlFor="r3">
                                                        Social Engagement
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 border-none">
                                                    <RadioGroupItem
                                                        value="default"
                                                        id="r1"
                                                    />
                                                    <Label htmlFor="r1">
                                                        Volume
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 border-none">
                                                    <RadioGroupItem
                                                        value="default"
                                                        id="r1"
                                                    />
                                                    <Label htmlFor="r1">
                                                        Marketcap
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2 border-none">
                                                    <RadioGroupItem
                                                        value="default"
                                                        id="r1"
                                                    />
                                                    <Label htmlFor="r1">
                                                        Likes
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size={null}
                                        className="bg-background px-6 py-2 text-base"
                                    >
                                        Order{" "}
                                        <IoIosArrowDown className="text-lg ml-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-fit text-xs font-talk">
                                    <DropdownMenuItem>
                                        <IoCheckmarkOutline className="mr-2 h-4 w-4 font-thin" />
                                        <span>Ascending</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <IoCheckmarkOutline className="mr-2 h-4 w-4 font-thin" />
                                        <span>Descending</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="md:w-3/4 md:pl-20 w-full grid md:grid-cols-4 grid-cols-4 md:mb-0 mb-5">
                            <Button
                                size={"lg"}
                                variant={"noShadow"}
                                className="bg-transparent col-span-1 !shadow-none rounded-r-none md:text-sm text-[0.65rem] text-wrap"
                            >
                                Live Streaming
                            </Button>
                            <Button
                                size={"lg"}
                                variant={"noShadow"}
                                className="bg-transparent col-span-1 !shadow-none border-l-none border-r-none rounded-none md:text-sm text-[0.65rem]"
                            >
                                Completed
                            </Button>
                            <Button
                                size={"lg"}
                                variant={"noShadow"}
                                className="bg-transparent col-span-1 !shadow-none border-l-none border-r-none rounded-none md:text-sm text-[0.65rem]"
                            >
                                Favourites
                            </Button>
                            <Button
                                size={"lg"}
                                variant={"noShadow"}
                                className="bg-transparent col-span-1 !shadow-none rounded-l-none md:text-sm text-[0.65rem]"
                            >
                                Active
                            </Button>
                        </div>
                    </div>
                    <ScrollArea className="max-h-[540px] flex overflow-auto">
                        <div className="grid lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 size-full gap-8 overflow-visible p-4">
                            {isLoading && (
                                <div className="col-span-full w-full flex items-center justify-center min-h-60">
                                    <Loader2Icon className="animate-spin h-10 w-10" />
                                </div>
                            )}
                            {!isLoading &&
                                tokens?.map((token, i) => {
                                    const holders = Array(token.users);
                                    return (
                                        <Card
                                            key={i + "-card"}
                                            img={token.img_url}
                                            title={token.token_name}
                                            date={null}
                                            className={
                                                "bg-transparent col-span-1 grid grid-cols-2 !shadow-none !border-none min-h-[230px] max-w-full min-w-full "
                                            }
                                            mint={token.token_mint_address}
                                            id={token.id.toString()}
                                            ticker={token.token_ticker}
                                            holders={
                                                holders ? holders.length : 0
                                            }
                                            creator={
                                                token.users?.username || "anon"
                                            }
                                        />
                                    );
                                })}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <Pagination className="mt-5 py-5">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            className="cursor-pointer"
                            onClick={() =>
                                handlePageChange(Math.max(1, currentPage - 1))
                            }
                        />
                    </PaginationItem>
                    {renderPageNumbers()}
                    <PaginationItem>
                        <PaginationNext
                            className="cursor-pointer"
                            onClick={() =>
                                handlePageChange(
                                    Math.min(totalPages, currentPage + 1)
                                )
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

export default TokenCardsGrid;

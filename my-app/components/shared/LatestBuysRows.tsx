"use client";

import { trpc } from "@/app/_trpc/client";
import DynamycOrder from "@/components/shared/ReOrder";
import { TableCell, TableRow } from "@/components/ui/table";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

export const formatAmount = (
  amount: string,
  useSuffix: boolean = false
): string => {
  // Convert the string to a BigInt
  const bigIntAmount = parseFloat(amount) / 1e9;

  // Remove 9 decimal places by dividing by 10^9
  const formattedAmount = bigIntAmount.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

  if (useSuffix) {
    const suffixes = ["", "K", "M", "B", "T"];
    let tier = 0;
    let scaledNum = bigIntAmount;

    while (scaledNum >= 1000 && tier < suffixes.length - 1) {
      tier++;
      scaledNum /= 1000;
    }

    return Math.floor(scaledNum).toString() + suffixes[tier];
  }
  return formattedAmount;
};

const LatestBuysRows = () => {
  const { data, isLoading, isError, refetch } = trpc.getLatestBuys.useQuery();

  const latestBuys = Array.isArray(data) ? data : [];

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <>
      {latestBuys?.length === 0 ? (
        <TableRow
          id="none"
          key="none"
          className={`border-none cursor-pointer bg-transparent transition-colors w-full items-center justify-between px-10 flex flex-row`}
        >
          <TableCell colSpan={3}>
            <div className="flex flex-row items-center justify-center">
              <span>No info</span>
            </div>
          </TableCell>
        </TableRow>
      ) : (
        latestBuys.map((buy, i) => (
          <TableRow
            key={`buys-${buy.raises?.token_mint_address}-${buy.id}-${i}`}
            id={String(buy.id)}
            className={`${
              (i + 1) % 2 !== 0 ? "bg-white" : "bg-black/5"
            } border-none cursor-pointer hover:bg-green-500/20 transition-colors w-full items-center justify-between px-5 flex flex-row`}
          >
            <TableCell className="p-1 w-full" colSpan={3}>
              <Link
                href={`/token/${buy.raises?.token_mint_address}`}
                className="flex items-center w-full gap-x-4"
              >
                <div className="flex-shrink-0">
                  <Avatar className="outline-1 rounded-xl h-12 w-12 bg-white">
                    <AvatarImage src={buy.raises?.img_url} />
                    <AvatarFallback>{buy.raises?.token_ticker}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-grow">{buy.raises?.token_ticker}</div>
                <div>{formatAmount(buy.amount_in)} SOL</div>
              </Link>
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  );
};

export default LatestBuysRows;

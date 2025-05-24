"use client";

import { useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import DynamycOrder from "@/components/shared/ReOrder";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatAmount } from "./LatestBuysRows";
import Link from "next/link";

const LatestBuysTable = () => {
  const { data, isLoading, isError, refetch } = trpc.getLatestSells.useQuery();

  const latestSells = Array.isArray(data) ? data : [];

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <>
      {latestSells.length === 0 ? (
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
        latestSells.map((sell, i) => (
          <TableRow
            key={`sells-${sell.raises?.token_mint_address}-${i}`}
            id={String(sell.raises?.token_mint_address)}
            className={`${
              (i + 1) % 2 !== 0 ? "bg-white" : "bg-black/5"
            } border-none cursor-pointer hover:bg-red-500/20 transition-colors w-full items-center justify-between px-5 flex flex-row`}
          >
            <TableCell className="p-1 w-full" colSpan={3}>
              <Link
                href={`/token/${sell.raises?.token_mint_address}`}
                className="flex items-center w-full gap-x-4"
              >
                <div className="flex-shrink-0">
                  <Avatar className="outline-1 rounded-xl h-12 w-12 bg-white">
                    <AvatarImage src={sell.raises?.img_url} />
                    <AvatarFallback>{sell.raises?.token_ticker}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-grow">{sell.raises?.token_ticker}</div>
                <div>{formatAmount(sell.amount_out)} SOL</div>
              </Link>
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  );
};

export default LatestBuysTable;

"use client";

import { useEffect } from "react";
import { trpc } from "@/app/_trpc/client";
import DynamycOrder from "@/components/shared/ReOrder";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";

const LatestChatRows = () => {
  const { data, isLoading, isError, refetch } = trpc.getLatestChats.useQuery();

  const latestComments = Array.isArray(data) ? data : [];
  console.log({ latestComments });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <>
      {latestComments.length === 0 ? (
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
        latestComments.map((comment, i) => (
          <TableRow
            key={`${comment.raise?.token_mint_address}-${i}`}
            id={`latest-chat-${i}`}
            className={`${
              (i + 1) % 2 !== 0 ? "bg-white" : "bg-black/5"
            } border-none cursor-pointer hover:bg-slate-600/40 transition-colors w-full items-center justify-between  px-5 flex flex-row`}
          >
            <TableCell className="p-1 w-full" colSpan={3}>
              <Link
                href={`/token/${comment.raise?.token_mint_address}`}
                className="flex items-center w-full gap-x-4"
              >
                <div className="flex-shrink-0">
                  <Avatar className="outline-1 rounded-xl h-12 w-12 bg-white">
                    <AvatarImage src={comment.raise?.img_url} />
                    <AvatarFallback>
                      {comment.raise?.token_ticker}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-grow">{comment.raise?.token_ticker}</div>
                <div>{comment.raise?._count.chats}</div>
              </Link>
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  );
};

export default LatestChatRows;

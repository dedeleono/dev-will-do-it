"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { topDev } from "@/public/imgs";

export interface GraphHeaderProps {
  name: string;
  symbol: string;
  tokenAddress: string;
  creatorWallet: string;
  creatorName?: string | null;
  creatorAvatar?: string | null;
  topDevTime?: Date | null;
  onClick?: ()=>void
}

export default function GraphHeader(props: GraphHeaderProps) {
  const {
    name,
    symbol,
    tokenAddress,
    creatorWallet,
    creatorName,
    creatorAvatar,
    topDevTime,
    onClick
  } = props;
  return (
    <div className="max-w-full w-full flex items-center justify-between pb-2">
      <div className="flex flex-row md:w-2/3 w-full md:py-0 py-2 md:justify-start md:px-0 justify-between">
        <div className="flex flex-col">
          <a
            href={`https://solscan.io/token/${tokenAddress}?cluster=devnet`}
            target="_blank"
          >
            <h4 className="md:text-lg text-sm hover:underline">
              {name} - ${symbol}
            </h4>
          </a>
          <span className="md:text-sm text-xs text-nowrap">
            (position #0001)
          </span>
        </div>

        <Button
          variant={"default"}
          size={"lg"}
          className="bg-[#FD29F0] md:ml-5 text-xs md:text-lg"
          onClick={onClick}
        >
          Add Live Stream
        </Button>
      </div>
      <div className="md:flex md:flex-row items-center max-w-1/3 hidden">
        <div className="flex flex-col items-start gap-1">
          <h4 className="text-xs">Created By:</h4>
          <a
            href={`https://solscan.io/account/${creatorWallet}?cluster=devnet`}
            target="_blank"
          >
            <span className="bg-foreground text-background rounded-md text-sm py-1.5 px-3 underline underline-offset-2 tracking-wide hover:text-gray-400">
              {creatorName ||
                (creatorWallet &&
                  `${creatorWallet.slice(0, 4)}...${creatorWallet.slice(-4)}`)}
            </span>
          </a>
        </div>

        {topDevTime && (
          <Image
            src={topDev.src}
            width={52}
            height={52}
            alt="cup"
            className="ml-3"
          />
        )}
      </div>
    </div>
  );
}

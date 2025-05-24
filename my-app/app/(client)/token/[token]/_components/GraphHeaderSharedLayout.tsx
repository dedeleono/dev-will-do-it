"use client";

import React, { useRef } from "react";
import Image from "next/image";
import GraphHeader, { GraphHeaderProps } from "./GraphHeader";
import AnimatedSharedLayout from "./AnimatedSharedLayout";
import { topDev } from "@/public/imgs";

const GraphHeaderLayout = (props: GraphHeaderProps) => {
  const animatedLayoutRef = useRef<{ handleAnimate: () => void }>(null);

  return (
    <React.Fragment>
      <GraphHeader
        name={props.name}
        symbol={props.symbol}
        tokenAddress={props.tokenAddress}
        creatorWallet={props.creatorWallet}
        creatorName={props.creatorName}
        creatorAvatar={props.creatorAvatar}
        topDevTime={props.topDevTime}
        onClick={() => animatedLayoutRef?.current?.handleAnimate()}
      />
      <AnimatedSharedLayout ref={animatedLayoutRef} />
      <div className="flex flex-row mt-2 items-center md:hidden">
        <div className="flex flex-row text-nowrap items-center gap-1">
          <h4 className="text-xs">Created By:</h4>
          <a
            href={`https://solscan.io/account/${props.creatorWallet}?cluster=devnet`}
            target="_blank"
          >
            <span className="bg-foreground text-background rounded-md text-sm py-1.5 px-3 underline underline-offset-2 tracking-wide hover:text-gray-400">
              {props.creatorName ||
                (props.creatorWallet &&
                  `${props.creatorWallet.slice(
                    0,
                    4
                  )}...${props.creatorWallet.slice(-4)}`)}
            </span>
          </a>
        </div>

        <Image
          src={topDev.src}
          width={50}
          height={50}
          alt="cup"
          className="ml-3"
        />
      </div>
    </React.Fragment>
  );
};

export default GraphHeaderLayout;

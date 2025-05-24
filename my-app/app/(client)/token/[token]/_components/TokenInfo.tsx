"use client";

import { FC, useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import Image from "next/image";
import { placeholder, topDev } from "@/public/imgs";
import { Loader2Icon } from "lucide-react";

interface TokenInfoProps {
    name: string;
    ticker: string;
    metadata_url: string;
    img_url: string;
}

export default function TokenInfo({
    name,
    ticker,
    metadata_url,
    img_url,
}: TokenInfoProps) {
    const [metadata, setMetadata] = useState<any>(null);

    useEffect(() => {
        fetch(metadata_url)
            .then((res) => res.json())
            .then((data) => setMetadata(data));
    }, [metadata_url]);

    return (
        <div className="w-full border-none  mt-2">
            <div className="grid grid-cols-1 size-full">
                <div className=" rounded-lg overflow-hidden dark:bg-gray-950">
                    <div className="flex flex-row">
                        <div className="w-3/4">
                            <Image
                                src={img_url || placeholder}
                                alt="token img"
                                width={1000}
                                height={1000}
                                className="w-full h-full object-cover rounded-md border border-black"
                            />
                        </div>

                        <div className="min-w-[50%] max-w-[50%] flex flex-col pl-5">
                            <h3 className="">{name}</h3>
                            <span>${ticker}</span>
                            <span className="text-xs font-work text-wrap">
                                {metadata?.description}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React, { FC } from "react";
import { Button } from "./button";
import {
    WalletMultiButton,
    BaseWalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

interface WalletMultiButtonStyledProps {
    className?: string;
}

const LABELS = {
    "change-wallet": "Change wallet",
    connecting: "Connecting ...",
    "copy-address": "Copy address",
    copied: "Copied",
    disconnect: "Disconnect",
    "has-wallet": "Connect Wallet",
    "no-wallet": "Connect Wallet",
} as const;

const WalletMultiButtonStyled: FC<WalletMultiButtonStyledProps> = ({
    className,
}) => {
    return (
        <>
            <Button
                variant="default"
                size="lg"
                className={className}
                asChild
                suppressHydrationWarning
            >
                <div>
                    <BaseWalletMultiButton
                        labels={LABELS}
                        className="inline-flex items-center text-black justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 "
                        style={{
                            background: "transparent",
                            color: "black",
                            fontFamily: "var(--font-talk-comic)",
                        }}
                    />
                </div>
            </Button>
        </>
    );
};

export default WalletMultiButtonStyled;

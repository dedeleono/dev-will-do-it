"use client";
import useTokenStore from "@/components/store/useTokenStore";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

export type FullTokenMeta = {
    tokenAddress: string;
    name: string;
    symbol: string;
    creatorWallet: string;
    creatorAvatar: string;
    creatorName: string;
};

export default function DataSetup(props: FullTokenMeta) {
    const { tokenAddress } = props;
    const {
        currentStats,
        init,
        getStats,
        getUserBalances,
        program,
        setTokenMeta,
        getSolanaPrice,
    } = useTokenStore((state) => ({
        currentStats: state.stats,
        init: state.initState,
        getStats: state.getStats,
        getUserBalances: state.getUserBalances,
        setTokenMeta: state.setTokenMeta,
        program: state.program,
        getSolanaPrice: state.getSolanaPrice,
    }));
    const wallet = useAnchorWallet();

    useEffect(() => {
        init?.(wallet);
    }, [init, wallet]);

    useEffect(() => {
        if (!program || !getStats) return;
        getStats(tokenAddress);
        const interval = setInterval(() => {
            getStats(tokenAddress);
        }, 15000);
        return () => clearInterval(interval);
    }, [getStats, program, tokenAddress]);

    useEffect(() => {
        if (!wallet || !program || !getUserBalances || !currentStats?.curveInfo)
            return;
        getUserBalances(wallet.publicKey.toBase58());
        const interval = setInterval(() => {
            getUserBalances(wallet.publicKey.toBase58());
        }, 10_000);
        return () => clearInterval(interval);
    }, [getUserBalances, program, wallet, currentStats]);

    useEffect(() => {
        getSolanaPrice();
        const interval = setInterval(() => {
            getSolanaPrice();
        }, 15000);
        return () => clearInterval(interval);
    }, [getSolanaPrice]);

    useEffect(() => {
        setTokenMeta?.(props);
    }, [props, setTokenMeta]);

    return <></>;
}

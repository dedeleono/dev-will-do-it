import { create } from "zustand";
import * as anchor from "@coral-xyz/anchor";
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    TransactionInstruction,
    ConfirmOptions,
    TokenAmount,
    Keypair,
} from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { DwdiPrograms, IDLType } from "@/lib/CurveIDL";
import {
    Program,
    Provider,
    AnchorProvider,
    getProvider,
    setProvider,
    BN,
} from "@coral-xyz/anchor";
import {
    closeAccount,
    createAssociatedTokenAccountInstruction,
    createSyncNativeInstruction,
    getAssociatedTokenAddressSync,
    getMint,
    NATIVE_MINT,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { UnwrapPromise } from "@/utils/common";
import { FullTokenMeta } from "@/app/(client)/token/[token]/_components/DataSetup";
import { generateKeyPair } from "crypto";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";

type BondingCurve = {
    dev?: PublicKey;
    slope_numerator: number;
    slope_denominator: number;
    liquidity_supply?: anchor.BN;
    max_tx_tokens: anchor.BN;
    sell_fee: anchor.BN;
    platform_fee?: anchor.BN;
    referral_basis: anchor.BN;
    vesting_basis: anchor.BN;
    vesting_interval: anchor.BN;
    vesting_start: anchor.BN;
    curve_start?: anchor.BN;
    status?: CurveStatus;
};

type MinimalCurveParms = {
    slopeNum: anchor.BN;
    slopeDen: anchor.BN;
    maxTxTokens: anchor.BN;
    sellFee: anchor.BN;
    referralBasis: anchor.BN;
    vestingBasis: anchor.BN;
    vestingInterval: anchor.BN;
    vestingStart: anchor.BN;
};

type CurveStatus = {
    init?: Record<string, never>;
    active?: Record<string, never>;
    success?: Record<string, never>;
    ended?: any;
    setup?: any;
};

type TokenStats = {
    total_raises: Number;
    processingFee: anchor.BN;
    platformFeeBasis: Number;
    owner: PublicKey;
    feeReceiver: PublicKey;
    tokenInfo: BondingCurve;
    curveInfo: {
        tokenMint: PublicKey;
        reserveMint: PublicKey;
        placeholderMint: PublicKey;
        placeholderMinted: TokenAmount;
        tokensSold: anchor.BN;
        tokenCurveHolder: PublicKey;
        tokensInCurve: TokenAmount;
        reserveInCurve: TokenAmount;
        jeetInCurve: TokenAmount;
    };
}; // Global Info

type TokenState = {
    wallet: AnchorWallet;
    connection: Connection;
    tokenMint?: PublicKey;
    tokenPrice?: number;
    availableInWallet?: number;
};
type UserBalances = {
    tokenBalance?: TokenAmount;
    reserveBalance?: TokenAmount;
    placeholderBalance?: TokenAmount;
    nativeBalance?: number;
};

interface TokenStore {
    program: Program<IDLType> | null;
    solanaPrice: number;
    stats: TokenStats;
    state: TokenState;
    balances: UserBalances;
    tokenMeta: FullTokenMeta;
    getStats: (tokenAddress: string) => Promise<void>;
    getUserBalances: (tokenAddress: string) => Promise<void>;
    initState: (wallet?: AnchorWallet) => Promise<void>;
    buyOrSell: (
        amount: number,
        buyOrSell: boolean,
        tokenMint: PublicKey,
        referral?: PublicKey
    ) => Promise<void>;
    claimTokens: () => Promise<void>;
    // createCurve: (params: any) => Promise<void>;
    enableCurveForAll: (curveToken: PublicKey) => Promise<void>;
    // endCurve: () => Promise<void>;
    setTokenMeta: (tokenMeta: FullTokenMeta) => void;
    getSolanaPrice: () => Promise<void>;
}

const zeroTokenAmount = {
    uiAmount: 0,
    amount: "0",
    decimals: 0,
} as TokenAmount;

const useTokenStore = create<TokenStore>((set, get) => ({
    program: null,
    solanaPrice: 0,
    stats: {} as TokenStats,
    state: {} as TokenState,
    balances: {} as UserBalances,
    tokenMeta: {} as FullTokenMeta,
    setTokenMeta: (tokenMeta: FullTokenMeta) => {
        set({ tokenMeta });
    },
    initState: async (wallet?: AnchorWallet) => {
        let provider: Provider | undefined = undefined;
        try {
            provider = getProvider();
            if (!provider.publicKey && !!wallet?.publicKey)
                throw new Error("Setup with wallet");
        } catch {
            const connection = new Connection(
                process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl("devnet")
            );
            if (wallet) {
                // Use AnchorProvider if wallet is available
                provider = new AnchorProvider(connection, wallet);
            } else {
                // Fallback to a basic provider that does not require a wallet
                // This could be a custom provider or a generic one that you define
                // that matches the Provider interface but does not perform any wallet operations.
                provider = {
                    connection: connection,
                    send: async (tx, signers, opts) => {
                        throw new Error(
                            "Wallet is required for sending transactions"
                        );
                    },
                };
            }
            setProvider(provider);
        }
        const program = new Program<IDLType>(DwdiPrograms, provider);
        set({ program });
        return;
    },
    getStats: async (tokenAddress: string) => {
        if (!tokenAddress || !PublicKey.isOnCurve(tokenAddress)) return;
        const program = get().program;
        if (!program) return;

        const token = new PublicKey(tokenAddress);

        const globalInfoAddress = PublicKey.findProgramAddressSync(
            [Buffer.from("global")],
            program.programId
        )[0];

        const curveAddress = PublicKey.findProgramAddressSync(
            [Buffer.from("curve"), token.toBuffer()],
            program.programId
        )[0];

        const globalInfoAccount = await program.account.globalInfo.fetch(
            globalInfoAddress
        );

        const bondingCurveInfoAccount =
            await program.account.bondingCurve.fetch(curveAddress);

        const placeholderMint = PublicKey.findProgramAddressSync(
            [Buffer.from("placeholder"), token.toBuffer()],
            program.programId
        )[0];

        const curveHolder = PublicKey.findProgramAddressSync(
            [Buffer.from("curve_holder"), token.toBuffer()],
            program.programId
        )[0];
        const reserveHolder = PublicKey.findProgramAddressSync(
            [Buffer.from("reserve_holder"), token.toBuffer()],
            program.programId
        )[0];
        const jeetHolder = PublicKey.findProgramAddressSync(
            [Buffer.from("jeet_tears"), token.toBuffer()],
            program.programId
        )[0];

        // Check if reserveHolder and jeetHolder exist
        const reserveExists = await program.provider.connection.getAccountInfo(
            reserveHolder
        );
        const jeetExists = await program.provider.connection.getAccountInfo(
            jeetHolder
        );

        const placeholderMinted =
            await program.provider.connection.getTokenSupply(placeholderMint);

        const tokensInCurve =
            await program.provider.connection.getTokenAccountBalance(
                curveHolder
            );

        const reserveInCurve = reserveExists
            ? await program.provider.connection.getTokenAccountBalance(
                  reserveHolder
              )
            : {
                  value: {
                      uiAmount: 0,
                      amount: "0",
                      decimals: 0,
                  } as TokenAmount,
              };

        const jeetInCurve = jeetExists
            ? await program.provider.connection.getTokenAccountBalance(
                  jeetHolder
              )
            : {
                  value: {
                      uiAmount: 0,
                      amount: "0",
                      decimals: 0,
                  } as TokenAmount,
              };

        const stats: TokenStats = {
            total_raises: globalInfoAccount.totalRaises.toNumber(),
            processingFee: globalInfoAccount.processingFee,
            platformFeeBasis: globalInfoAccount.platformFeeBasis.toNumber(),
            owner: globalInfoAccount.owner,
            feeReceiver: globalInfoAccount.feeReceiver,
            tokenInfo: {
                dev: bondingCurveInfoAccount.dev,
                slope_numerator: bondingCurveInfoAccount.a,
                slope_denominator: bondingCurveInfoAccount.b,
                liquidity_supply: bondingCurveInfoAccount.liquiditySupply,
                max_tx_tokens: bondingCurveInfoAccount.maxTxTokens,
                sell_fee: bondingCurveInfoAccount.sellFee,
                platform_fee: bondingCurveInfoAccount.platformFee,
                referral_basis: bondingCurveInfoAccount.referralBasis,
                vesting_basis: bondingCurveInfoAccount.vestingBasis,
                vesting_interval: bondingCurveInfoAccount.vestingInterval,
                vesting_start: bondingCurveInfoAccount.vestingStart,
                curve_start: bondingCurveInfoAccount.curveStart,
                status: bondingCurveInfoAccount.status,
            },
            curveInfo: {
                tokenMint: token,
                tokensSold: bondingCurveInfoAccount.tokensSold,
                reserveMint: bondingCurveInfoAccount.reserveToken,
                placeholderMint: placeholderMint,
                placeholderMinted: placeholderMinted.value,
                tokenCurveHolder: curveHolder,
                tokensInCurve: tokensInCurve.value,
                reserveInCurve: reserveInCurve.value,
                jeetInCurve: jeetInCurve.value,
            },
        };

        set({
            stats,
        });

        return;
    },
    buyOrSell: async (
        amount: number,
        buyOrSell: boolean,
        tokenMint: PublicKey,
        referral?: PublicKey
    ) => {
        const program = get().program;
        const _state = get().state;
        if (!program) return;

        const globalInfoAddress = await PublicKey.findProgramAddressSync(
            [Buffer.from("global_info")],
            program.programId
        )[0];

        const bondingCurveInfoAddress = await PublicKey.findProgramAddressSync(
            [Buffer.from("bonding_curve")],
            program.programId
        )[0];

        const globalInfoAccount = await program.account.globalInfo.fetch(
            globalInfoAddress
        );

        const bondingCurveInfoAccount =
            await program.account.bondingCurve.fetch(bondingCurveInfoAddress);

        const protocolFeeReceiverAddress = getAssociatedTokenAddressSync(
            tokenMint, //url,
            globalInfoAccount.feeReceiver
        );

        const reserveHolder = await PublicKey.findProgramAddressSync(
            [Buffer.from("reserve_holder"), tokenMint.toBuffer()],
            program.programId
        )[0];

        const reserveMint = (await getMint(_state.connection, reserveHolder))
            .address;

        const packageIxs = [];
        let shouldCloseAccount = false;

        // check iF PROTOCOL_FEE_RECEIVER TOKEN ACCOUNT exists if it doesnt create instruction

        const protocolFeeAccountInfo = await _state.connection
            .getTokenAccountBalance(protocolFeeReceiverAddress)
            .catch(() => null);

        if (!protocolFeeAccountInfo) {
            packageIxs.push(
                createAssociatedTokenAccountInstruction(
                    _state.wallet.publicKey,
                    protocolFeeReceiverAddress,
                    globalInfoAccount.feeReceiver,
                    tokenMint
                )
            );
        }

        // check if USER CURVE HOLDER account exists
        // check if USER RESERVE HOLDER account exists (ONLY IF reserveToken === NATIVE_MINT)
        //------------------------------------------------------------
        //------------------------------------------------------------
        //------------------------------------------------------------
        const associatedReserveTokenAccount = getAssociatedTokenAddressSync(
            reserveMint,
            _state.wallet.publicKey
        ); //USER_RESERVE_HOLDER

        const associatedCurveTokenAccount = getAssociatedTokenAddressSync(
            tokenMint,
            _state.wallet.publicKey
        ); //USER_CURVE_HOLDER

        await _state.connection
            .getTokenAccountBalance(associatedCurveTokenAccount)
            .catch(() => {
                packageIxs.push(
                    createAssociatedTokenAccountInstruction(
                        _state.wallet.publicKey,
                        associatedCurveTokenAccount,
                        _state.wallet.publicKey,
                        tokenMint
                    )
                );
            });
        // user placeholder account
        if (reserveMint.toBase58() === NATIVE_MINT.toBase58()) {
            // Handle SOL
            const currentBalance = await _state.connection
                .getTokenAccountBalance(associatedReserveTokenAccount)
                .catch(() => null);

            let transferAmount = amount;
            // if WSOL account does not exist, create one
            if (currentBalance === null) {
                packageIxs.push(
                    createAssociatedTokenAccountInstruction(
                        _state.wallet.publicKey,
                        associatedReserveTokenAccount,
                        _state.wallet.publicKey,
                        NATIVE_MINT
                    ),
                    SystemProgram.transfer({
                        fromPubkey: _state.wallet.publicKey,
                        toPubkey: associatedReserveTokenAccount,
                        lamports: transferAmount,
                    }),
                    createSyncNativeInstruction(associatedReserveTokenAccount)
                );
                shouldCloseAccount = true;
            } else {
                const actualBalance = currentBalance.value.uiAmount || 0;
                transferAmount = amount - actualBalance;
                shouldCloseAccount = actualBalance - amount === 0;
                if (transferAmount > 0) {
                    packageIxs.push(
                        SystemProgram.transfer({
                            fromPubkey: _state.wallet.publicKey,
                            toPubkey: associatedReserveTokenAccount,
                            lamports: transferAmount,
                        }),
                        createSyncNativeInstruction(
                            associatedReserveTokenAccount
                        )
                    );
                    shouldCloseAccount = true;
                }
            }
        }
        //------------------------------------------------------------
        //------------------------------------------------------------
        //------------------------------------------------------------

        // @note from PROGRAM

        const transaction = new anchor.web3.Transaction();

        try {
            const tx = program.methods
                .buyOrSell(new anchor.BN(amount), buyOrSell)
                .accountsPartial({
                    curveToken: tokenMint,
                    reserveToken: reserveMint,
                    referralReserveAccount: referral,
                    protocolFeeReceiver: protocolFeeReceiverAddress,
                })
                .preInstructions(packageIxs);

            transaction.add(tx as unknown as anchor.web3.Transaction);

            const txSignature = await program.provider.sendAndConfirm?.(
                transaction
            );

            if (shouldCloseAccount) {
                const payerKeypair = Keypair.generate();

                const closeIx = await closeAccount(
                    _state.connection, // connection
                    payerKeypair, // payer
                    associatedReserveTokenAccount, // account
                    _state.wallet.publicKey, // destination
                    _state.wallet.publicKey // authority
                );

                transaction.add(closeIx as unknown as anchor.web3.Transaction);

                const closeSignature = await program.provider.sendAndConfirm?.(
                    transaction
                );

                console.log("Closed account with signature:", closeSignature);
            }

            console.log("Transaction confirmed with signature:", txSignature);
        } catch (error) {
            console.error("Error during buyOrSell transaction:", error);
        }
    },
    claimTokens: async () => {
        const program = get().program;
        if (!program) return;

        const { wallet } = get().state;

        const transaction = new anchor.web3.Transaction();

        try {
            const tx = program.methods.claimTokens().accountsPartial({
                signer: wallet.publicKey,
            });

            transaction.add(tx as any);

            const txSignature = await program.provider.sendAndConfirm?.(
                transaction
            );

            console.log("Transaction confirmed with signature:", txSignature);
        } catch (error) {
            console.error("Error during claimTokens transaction:", error);
        }
    },
    enableCurveForAll: async (curveToken: PublicKey) => {
        const program = get().program;
        if (!program) return;

        const { wallet } = get().state;

        const transaction = new anchor.web3.Transaction();

        const globalInfoAddress = await PublicKey.findProgramAddressSync(
            [Buffer.from("global_info")],
            program.programId
        )[0];

        const curveDataAddress = await PublicKey.findProgramAddressSync(
            [Buffer.from("curve_data"), curveToken.toBuffer()],
            program.programId
        )[0];

        const tx = program.methods
            .enableCurveForAll(curveToken)
            .accountsPartial({
                signer: wallet.publicKey,
                globalInfo: globalInfoAddress,
                curveData: curveDataAddress,
            });

        transaction.add(tx as any);

        try {
            // Send and confirm the transaction
            const txSignature = await program.provider.sendAndConfirm?.(
                transaction
            );
            console.log("Transaction confirmed with signature:", txSignature);
        } catch (error) {
            console.error("Error during enableCurveForAll transaction:", error);
        }
    },
    getUserBalances: async (userWallet: string) => {
        if (!userWallet || !PublicKey.isOnCurve(userWallet)) return;
        const program = get().program;
        if (!program) return;

        const currentStats = get().stats;
        if (!currentStats.curveInfo) return;

        const tokenMint = currentStats.curveInfo.tokenMint;
        const reserveMint = currentStats.curveInfo.reserveMint;
        const placeholderMint = currentStats.curveInfo.placeholderMint;

        let tokenBalance: TokenAmount = {
            uiAmount: 0,
            amount: "0",
            decimals: 0,
        };
        let reserveBalance: TokenAmount = {
            uiAmount: 0,
            amount: "0",
            decimals: 0,
        };
        let placeholderBalance: TokenAmount = {
            uiAmount: 0,
            amount: "0",
            decimals: 0,
        };

        const wallet = new PublicKey(userWallet);

        const userTokenHolder = getAssociatedTokenAddressSync(
            tokenMint,
            wallet
        );
        const userReserveHolder = getAssociatedTokenAddressSync(
            reserveMint,
            wallet
        );
        const userPlaceholderHolder = getAssociatedTokenAddressSync(
            placeholderMint,
            wallet
        );

        reserveBalance = await program.provider.connection
            .getTokenAccountBalance(userReserveHolder)
            .then((res) => res.value)
            .catch((e) => {
                console.log("Error fetching user reserve balance", e);
                return zeroTokenAmount;
            });
        tokenBalance = await program.provider.connection
            .getTokenAccountBalance(userTokenHolder)
            .then((res) => res.value)
            .catch((e) => {
                console.log("Error fetching user token balance", e);
                return zeroTokenAmount;
            });

        placeholderBalance = await program.provider.connection
            .getTokenAccountBalance(userPlaceholderHolder)
            .then((res) => res.value)
            .catch((e) => {
                console.log("Error fetching user placeholder balance", e);
                return zeroTokenAmount;
            });

        const nativeBalance = await program.provider.connection.getBalance(
            wallet
        );

        set({
            balances: {
                tokenBalance,
                reserveBalance,
                placeholderBalance,
                nativeBalance,
            },
        });
    },
    getSolanaPrice: async () => {
        // Get the Stable Hermes service URL from https://docs.pyth.network/price-feeds/api-instances-and-providers/hermes
        const connection = new PriceServiceConnection(
            "https://hermes.pyth.network"
        );

        const priceIds = [
            "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", // SOL/USD price id
        ];

        // Get the latest values of the price feeds as JSON objects.
        const currentPrices = await connection.getLatestPriceFeeds(priceIds);
        console.log(currentPrices);
        if (!currentPrices) return;
        const priceInfo = currentPrices?.[0].getPriceUnchecked();
        set({
            solanaPrice: parseInt(priceInfo.price) * 10 ** priceInfo.expo || 0,
        });
    },
}));

export default useTokenStore;

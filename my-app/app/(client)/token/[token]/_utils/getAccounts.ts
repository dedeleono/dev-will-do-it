import {
    createAssociatedTokenAccountInstruction,
    createCloseAccountInstruction,
    createSyncNativeInstruction,
    getAssociatedTokenAddressSync,
    NATIVE_MINT,
} from "@solana/spl-token";
import {
    PublicKey,
    Connection,
    SystemProgram,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";

export const getBuyInstructions = async (
    connection: Connection,
    placeholderMint: PublicKey,
    curveMint: PublicKey,
    reserveToken: PublicKey,
    wallet: PublicKey,
    amount: number
) => {
    const associatedTokenAccount = getAssociatedTokenAddressSync(
        reserveToken,
        wallet
    );
    const associatedPlaceholderTokenAccount = getAssociatedTokenAddressSync(
        placeholderMint,
        wallet
    );
    const associatedCurveTokenAccount = getAssociatedTokenAddressSync(
        curveMint,
        wallet
    );
    console.log("reserveAccount", associatedTokenAccount.toBase58());

    const preInstructions = [];
    let shouldCloseAccount = false;

    if (reserveToken.toBase58() === NATIVE_MINT.toBase58()) {
        const currentBalance = await connection
            .getTokenAccountBalance(associatedTokenAccount)
            .catch(() => null);
        let transferAmount = amount;
        // if WSOL account does not exist, create one
        if (currentBalance === null) {
            preInstructions.push(
                createAssociatedTokenAccountInstruction(
                    wallet,
                    associatedTokenAccount,
                    wallet,
                    NATIVE_MINT
                ),
                SystemProgram.transfer({
                    fromPubkey: wallet,
                    toPubkey: associatedTokenAccount,
                    lamports: transferAmount * LAMPORTS_PER_SOL,
                }),
                createSyncNativeInstruction(associatedTokenAccount)
            );
            shouldCloseAccount = true;
        } else {
            const actualBalance = currentBalance.value.uiAmount || 0;
            transferAmount = amount - actualBalance;
            shouldCloseAccount = actualBalance - amount === 0;
            if (transferAmount > 0) {
                preInstructions.push(
                    SystemProgram.transfer({
                        fromPubkey: wallet,
                        toPubkey: associatedTokenAccount,
                        lamports: transferAmount * LAMPORTS_PER_SOL,
                    }),
                    createSyncNativeInstruction(associatedTokenAccount)
                );
                shouldCloseAccount = true;
            }
        }
    }

    const placeholderTokenData = await connection
        .getTokenAccountBalance(associatedPlaceholderTokenAccount)
        .catch(() => null);
    if (placeholderTokenData === null) {
        preInstructions.push(
            createAssociatedTokenAccountInstruction(
                wallet,
                associatedPlaceholderTokenAccount,
                wallet,
                placeholderMint
            )
        );
    }
    const curveTokenData = await connection
        .getTokenAccountBalance(associatedCurveTokenAccount)
        .catch(() => null);
    if (curveTokenData === null) {
        preInstructions.push(
            createAssociatedTokenAccountInstruction(
                wallet,
                associatedCurveTokenAccount,
                wallet,
                curveMint
            )
        );
    }

    const postInstructions = [];
    if (shouldCloseAccount) {
        postInstructions.push(
            createCloseAccountInstruction(
                associatedTokenAccount,
                wallet,
                wallet
            )
        );
    }
    return { preInstructions, postInstructions };
};

export const getSellInstructions = async (
    connection: Connection,
    reserveToken: PublicKey,
    wallet: PublicKey
) => {
    const associatedTokenAccount = getAssociatedTokenAddressSync(
        reserveToken,
        wallet
    );
    const preInstructions = [];
    const postInstructions = [];
    if (reserveToken.toBase58() === NATIVE_MINT.toBase58()) {
        const currentBalance = await connection
            .getTokenAccountBalance(associatedTokenAccount)
            .catch(() => null);
        // if WSOL account does not exist, create one
        if (currentBalance === null) {
            preInstructions.push(
                createAssociatedTokenAccountInstruction(
                    wallet,
                    associatedTokenAccount,
                    wallet,
                    NATIVE_MINT
                ),
                SystemProgram.transfer({
                    fromPubkey: wallet,
                    toPubkey: associatedTokenAccount,
                    lamports: 0.0000001 * LAMPORTS_PER_SOL,
                }),
                createSyncNativeInstruction(associatedTokenAccount)
            );
        }
        postInstructions.push(
            createCloseAccountInstruction(
                associatedTokenAccount,
                wallet,
                wallet
            )
        );
    }
    return { preInstructions, postInstructions };
};

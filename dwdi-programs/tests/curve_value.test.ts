import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { DwdiPrograms } from "../target/types/dwdi_programs";
import { waitForTransaction } from "../lib/helpers";
import { PublicKey } from "@solana/web3.js";
import { expect, it, describe } from "vitest";
import {
    createAssociatedTokenAccountInstruction,
    createMint,
    createSyncNativeInstruction,
    getAssociatedTokenAddressSync,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    NATIVE_MINT,
} from "@solana/spl-token";

const BN = anchor.BN;

describe("DWDI Raise Program", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const defaultSigner = anchor.AnchorProvider.env().wallet;
    const connection = anchor.getProvider().connection;

    const program = anchor.workspace.DwdiPrograms as Program<DwdiPrograms>;
    const test_id = new BN(1);
    const test_id2 = new BN(2);
    const idBuffer = new BN(1).toArrayLike(Buffer, "le", 8);
    const idBuffer2 = new BN(2).toArrayLike(Buffer, "le", 8);

    it("should create a test curve", async () => {
        const a = 0.00000000064;
        const b = 0.000000007;
        const tx = await program.methods.createTestCurve(test_id, a, b).rpc();
        await waitForTransaction(connection, tx);
        const test_curve_account = PublicKey.findProgramAddressSync(
            [Buffer.from("curve"), idBuffer],
            program.programId
        )[0];
        const test_curve = await program.account.testCurve.fetch(
            test_curve_account
        );
        expect(test_curve.a).toEqual(a);
        expect(test_curve.b).toEqual(b);
    });

    it("Should calculate the tokens out", async () => {
        const buyAmount = new BN(LAMPORTS_PER_SOL);

        for (let i = 0; i < 26; i++) {
            const tx = await program.methods
                .testCurve(test_id, buyAmount, true)
                .rpc();
            await waitForTransaction(connection, tx);
            const test_curve_account = PublicKey.findProgramAddressSync(
                [Buffer.from("curve"), idBuffer],
                program.programId
            )[0];
            const test_curve = await program.account.testCurve.fetch(
                test_curve_account
            );
            // console.log(`run ${i}`, {
            //     tokens_sold: test_curve.tokensSold.toString(),
            //     reserve_collected: test_curve.reserveCollected.toString(),
            // });
        }
    });
    it("Should calculate reserve out", async () => {
        const a = 0.00000000064;
        const b = 0.000000007;
        const createTx = await program.methods
            .createTestCurve(test_id2, a, b)
            .rpc();
        await waitForTransaction(connection, createTx);
        const test_curve_account = PublicKey.findProgramAddressSync(
            [Buffer.from("curve"), idBuffer2],
            program.programId
        )[0];
        // 15 SOl buys
        const buyAmount = new BN(LAMPORTS_PER_SOL);
        const buyTx = await program.methods
            .testCurve(test_id2, buyAmount.mul(new BN(15)), true)
            .rpc();
        await waitForTransaction(connection, buyTx);
        const test_curve = await program.account.testCurve.fetch(
            test_curve_account
        );
        console.log(`init_sells ${test_id2}`, {
            tokens_sold: test_curve.tokensSold.toString(),
            reserve_collected: test_curve.reserveCollected.toString(),
        });
        // test sells
        for (let i = 0; i < 1; i++) {
            const sellTx = await program.methods
                .testCurve(test_id2, buyAmount.mul(new BN(354_240_672)), false)
                .rpc();
            await waitForTransaction(connection, sellTx);
            const test_curve = await program.account.testCurve.fetch(
                test_curve_account
            );
            console.log(`sell ${i}`, {
                tokens_sold: test_curve.tokensSold.toString(),
                reserve_collected: test_curve.reserveCollected.toString(),
            });
        }
    });
});

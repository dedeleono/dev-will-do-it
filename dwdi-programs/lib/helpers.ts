import { Connection } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { DwdiPrograms } from "../target/types/dwdi_programs";
import * as anchor from "@coral-xyz/anchor";

export async function waitForTransaction(connection: Connection, tx: string) {
    const latestblock = await connection.getLatestBlockhash("confirmed");
    console.log("TX: ", tx);
    await connection
        .confirmTransaction({
            ...latestblock,
            signature: tx,
        })
        .then(() => console.log("tx success"))
        .catch((err) => console.log("TX failed", err));
}

export function setupDwdiProgramsEnv() {
    anchor.setProvider(anchor.AnchorProvider.env());
    const defaultSigner = anchor.AnchorProvider.env().wallet;
    const connection = anchor.getProvider().connection;
    const program = anchor.workspace.DwdiPrograms as Program<DwdiPrograms>;
    return { defaultSigner, connection, program };
}

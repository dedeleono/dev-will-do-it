import { setupDwdiProgramsEnv, waitForTransaction } from "lib/helpers";
import { BN } from "bn.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

async function main() {
    const { defaultSigner, connection, program } = setupDwdiProgramsEnv();
    const tx = await program.methods
        .initialize(defaultSigner.publicKey, new BN(0.01 * LAMPORTS_PER_SOL))
        .rpc();
    await waitForTransaction(connection, tx);
}
main();

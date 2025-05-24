import { setupDwdiProgramsEnv, waitForTransaction } from "lib/helpers";
import { BN } from "bn.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

async function main() {
    const { defaultSigner, connection, program } = setupDwdiProgramsEnv();
    const newFee = new BN(LAMPORTS_PER_SOL * 0.01);
    const tx = await program.methods.updateGlobalFee(newFee).rpc();
    await waitForTransaction(connection, tx);
}
main();

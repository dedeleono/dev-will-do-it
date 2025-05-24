import { Connection } from "@solana/web3.js";

export async function waitForTransaction(connection: Connection, tx: string) {
  const latestblock = await connection.getLatestBlockhash("confirmed");
  console.log("checking if tx was successful", tx);
  return await connection
    .confirmTransaction({
      ...latestblock,
      signature: tx,
    })
    .then(() => {
      console.log("tx was successful");
      return true;
    })
    .catch(() => {
      console.log("tx was not successful");
      return false;
    });
}

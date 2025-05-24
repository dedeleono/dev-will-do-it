"use client";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback } from "react";

export default function useTxChecker() {
  const { connection } = useConnection();
  const { toast } = useToast();

  const checkTx = useCallback(
    async (
      tx: string | null,
      action: string,
      loadingSetter: (val: boolean) => void,
      onSuccess?: (tx: string) => void
    ) => {
      if (!connection) return;
      if (!tx) {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: "Your transaction was cancelled or it failed",
        });
        loadingSetter(false);
        return;
      }
      toast({
        title: action,
        description: `${tx.slice(0, 6)}...${tx.slice(-6)}`,
        action: (
          <>
            <ToastAction
              altText="View on Solscan"
              onClick={() => {
                window.open(`https://solscan.io/tx/${tx}`, "_blank");
              }}
            >
              View on Solscan
            </ToastAction>
          </>
        ),
      });
      const latestblock = await connection.getLatestBlockhash("finalized");
      console.log("Confirmation block", latestblock.blockhash);
      const response = await connection
        .confirmTransaction({
          ...latestblock,
          signature: tx,
        })
        .then(() => {
          return "OK";
        })
        .catch(async (e) => {
          console.log("confirmation Error", e);
          console.log("getting transaction");
          const txResp = await connection
            .getTransaction(tx, {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 1,
            })
            .catch((e) => {
              console.log("getting transaction error", e);
              return null;
            });
          if (
            (txResp?.meta as any & { status?: { Ok?: null } })?.status?.Ok ===
            undefined
          )
            return null;
          return "OK";
        });
      console.log("confirmation Response", response);
      if (response === "OK" || response !== null) {
        toast({
          variant: "success",
          title: "Transaction Confirmed",
          description: `${tx.slice(0, 6)}...${tx.slice(-6)}`,
        });
        onSuccess?.(tx);
      } else {
        toast({
          variant: "destructive",
          title: "Transaction Failed",
          description: "Your transaction was cancelled or it failed",
        });
      }
      loadingSetter(false);
    },
    [connection, toast]
  );

  return { checkTx };
}

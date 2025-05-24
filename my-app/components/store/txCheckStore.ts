import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  allTxs: {
    [id: string]: { status: "pending" | "confirmed" | "failed" };
  };
};

type Actions = {
  addTx: (tx: { id: string }) => void;
  updateTx: (tx: {
    id: string;
    status: "pending" | "confirmed" | "failed";
  }) => void;
};

export const useTxCheckStore = create<State & Actions>()(
  immer((set) => ({
    allTxs: {},
    addTx: (tx) =>
      set((state) => {
        state.allTxs[tx.id] = {
          status: "pending",
        };
      }),
    updateTx: (tx) =>
      set((state) => {
        state.allTxs[tx.id] = tx;
      }),
  }))
);

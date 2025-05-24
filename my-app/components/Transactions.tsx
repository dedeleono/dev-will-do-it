import { trpc } from "@/app/_trpc/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BN } from "@coral-xyz/anchor";
import { FC } from "react";

//@todo Integrate with actual data from DB.

//DUMMY DATA
const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV008",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV009",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV010",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
];

interface Transaction {
  account?: string;
  buyOrSell?: string;
  sol?: BN;
  tokenAmount?: BN;
  timestamp?: Date;
  txHash?: string;
}

interface TxsProps {
  transactions: Transaction[];
  ticker: string;
}

const Txs: FC<TxsProps> = ({ transactions, ticker }) => {
  return (
    <div className="mt-4 rounded-md border-2 border-black">
      <Table className="size-full overflow-x-auto">
        <TableHeader className="rounded-sm">
          <TableRow className="bg-foreground rounded-sm">
            <TableHead className="w-[125px] text-white text-center rounded-l-sm">
              Account
            </TableHead>
            <TableHead className="text-white text-left">Buy/Sell</TableHead>
            <TableHead className="text-white text-left">SOL</TableHead>
            <TableHead className="text-white text-center">${ticker}</TableHead>
            <TableHead className="text-white text-center">TimeStamp</TableHead>
            <TableHead className="text-white text-center rounded-r-sm">
              Txn Hash
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rounded-b-lg ">
          {invoices.map((invoice, i) => (
            <TableRow
              key={invoice.invoice}
              className={`${
                (i + 1) % 2 !== 0 ? "bg-white" : "bg-black/5"
              } border-none cursor-pointer hover:bg-[#00FDA0]/20 transition-colors`}
            >
              <TableCell className="font-base text-center">
                {invoice.invoice}
              </TableCell>
              <TableCell className="text-left">
                {invoice.paymentStatus}
              </TableCell>
              <TableCell className="text-left">
                {invoice.paymentMethod}
              </TableCell>
              <TableCell className="text-center">
                {invoice.totalAmount}
              </TableCell>
              <TableCell className="text-center">
                {invoice.totalAmount}
              </TableCell>
              <TableCell className="text-center">
                {invoice.totalAmount}
              </TableCell>
            </TableRow>
          ))}
          {/* {transactions.map((txn, i) => (
              <TableRow
                key={txn.txHash}
                className={`${
                  (i + 1) % 2 !== 0 ? "bg-white" : "bg-black/5"
                } border-none cursor-pointer hover:bg-[#00FDA0]/20 transition-colors`}
              >
                <TableCell className="font-base text-center">
                  {txn.account}
                </TableCell>
                <TableCell className="text-left">
                  {txn.buyOrSell}
                </TableCell>
                <TableCell className="text-left">
                  {txn.sol as unknown as string}
                </TableCell>
                <TableCell className="text-center">
                  {txn.tokenAmount as unknown as string}
                </TableCell>
                <TableCell className="text-center">
                  {txn.timestamp as unknown as string}
                </TableCell>
                <TableCell className="text-center">
                  {txn.txHash}
                </TableCell>
              </TableRow>
            ))} */}
        </TableBody>
      </Table>
    </div>
  );
};

export default Txs;

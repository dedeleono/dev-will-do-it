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
import { FC } from "react";

//TODO: Integrate with actual data from DB.

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

const Leaderboard: FC = () => {
  return (
    <div className="size-full overflow-x-auto md:mt-[calc(323px)] mt-[calc(697px)] border-2 border-black rounded-b-lg">
    <Table className="">
      <TableHeader className="">
        <TableRow className="bg-foreground">
          <TableHead className="w-[125px] text-white text-center">
            Rank
          </TableHead>
          <TableHead className="text-white text-left">Project</TableHead>
          <TableHead className="text-white text-left">Ticker</TableHead>
          <TableHead className="text-white text-center">Created By</TableHead>
          <TableHead className="text-white text-center">Completion %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="rounded-b-md">
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
            <TableCell className="text-left">{invoice.paymentStatus}</TableCell>
            <TableCell className="text-left">{invoice.paymentMethod}</TableCell>
            <TableCell className="text-center">{invoice.totalAmount}</TableCell>
            <TableCell className="text-center">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
  );
};

export default Leaderboard;

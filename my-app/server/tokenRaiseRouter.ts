import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { PublicKey, Connection } from "@solana/web3.js";
import { prisma } from "@/prisma/client";
import { TRPCError } from "@trpc/server";
import bs58 from "bs58";
import { DwdiPrograms, IDLType } from "@/lib/CurveIDL";
import { decodeInstruction } from "./utils";
import compact from "lodash/compact";
import { Program } from "@coral-xyz/anchor";
import { getPrice } from "@/utils/curveMath";
import { Public } from "@prisma/client/runtime/library";

const tokenRaiseRouter = router({
    getTokenInfo: publicProcedure
        .input(z.string().refine((val) => PublicKey.isOnCurve(val)))
        .query(async ({ input }) => {
            const raiseInfo = await prisma.raises.findFirst({
                where: {
                    token_mint_address: input,
                },
                select: {
                    id: true,
                    token_mint_address: true,
                    token_name: true,
                    token_ticker: true,
                    top_dev_time: true,
                    img_url: true,
                    metadata_url: true,
                    socials: true,
                    tags: true,
                    users: {
                        select: {
                            wallet: true,
                            username: true,
                            profile_img: true,
                        },
                    },
                },
            });
            return raiseInfo;
        }),
    getTokenHolders: publicProcedure
        .input(
            z
                .object({
                    mint: z.string().refine((val) => {
                        try {
                            bs58.decode(val);
                            return true;
                        } catch {
                            return false;
                        }
                    }, "Invalid mint string"),
                    baseMint: z
                        .string()
                        .refine(
                            (val) => PublicKey.isOnCurve(val),
                            "Invalid Base Mint"
                        )
                        .nullish(),
                    isPlaceholder: z.boolean(),
                })
                .refine(
                    ({ mint, isPlaceholder, baseMint }) => {
                        if (isPlaceholder) {
                            if (!baseMint) return false;
                            return (
                                PublicKey.findProgramAddressSync(
                                    [
                                        Buffer.from("placeholder"),
                                        new PublicKey(baseMint).toBuffer(),
                                    ],
                                    new PublicKey(DwdiPrograms.address)
                                )[0].toBase58() === mint
                            );
                        }
                        return true;
                    },
                    {
                        message: "Invalid placeholder mint PDA",
                        path: ["mint"],
                    }
                )
        )
        .query(async ({ input }) => {
            const RPC_URL = process.env.HELIUS_RPC;
            if (!RPC_URL) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "HELIUS_RPC is not set",
                });
            }
            // Pagination logic
            let page = 1;
            // @todo if raise has vesting, need to get holders of placeholder mint
            // allOwners will store all the addresses that hold the token
            const allOwners: Array<{ owner: string; amount: number }> = [];

            while (true) {
                const response = await fetch(RPC_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        jsonrpc: "2.0",
                        method: "getTokenAccounts",
                        id: "helius-token-holders",
                        params: {
                            page: page,
                            limit: 1000,
                            displayOptions: {},
                            //mint address for the token we are interested in
                            mint: input.mint,
                        },
                    }),
                });
                const data = await response.json();
                // Pagination logic.
                if (!data.result || data.result.token_accounts.length === 0) {
                    console.log(`No more results. Total pages: ${page - 1}`);
                    break;
                }
                console.log(`Processing ${data.result.token_accounts.length} accounts on page ${page}`);
                // Adding unique owners to a list of token owners.
                data.result.token_accounts.forEach(
                    (account: TokenAccountsReturn) => {
                        if (!account.frozen && account.amount > 0) { // Only add accounts with positive balance
                            allOwners.push({
                                owner: account.owner,
                                amount: account.amount,
                            });
                        }
                    }
                );
                page++;
            }

            const sortedOwners = allOwners
                .filter(owner => owner.amount > 0)
                .sort((a, b) => b.amount - a.amount);
            return {
                topTen: sortedOwners.slice(0, 10),
                holders: sortedOwners,
                totalHolders: sortedOwners.length,
            };
        }),

    createTx: publicProcedure
        .input(
            z.object({
                wallet: z.string().refine((val) => PublicKey.isOnCurve(val)),
                token: z.string().refine((val) => PublicKey.isOnCurve(val)),
                type: z.enum(["buy", "sell"]),
                tx: z.string().refine((val) => bs58.decode(val).length === 64),
            })
        )
        .mutation(async ({ input }) => {
            const { wallet, type, tx } = input;
            if (!process.env.BACKEND_TEST_SOLANA_RPC) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "TRRXX",
                });
            }
            const isBuy = type === "buy";
            // Check if the TX has not been used before
            const txExists = await prisma.txs_used.findFirst({
                where: {
                    tx: tx,
                },
            });
            if (txExists) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR03",
                });
            }
            const raise = await prisma.raises.findFirst({
                where: {
                    token_mint_address: input.token,
                },
            });
            if (!raise) {
                throw new TRPCError({
                    // Token Raise does not exist
                    code: "BAD_REQUEST",
                    message: "TRR10",
                });
            }
            // Check that TX sender is same as wallet
            const connection = new Connection(
                process.env.BACKEND_TEST_SOLANA_RPC
            );
            // check that TX was successful
            const txSuccess = await connection.getSignatureStatus(tx, {
                searchTransactionHistory: true,
            });
            if (
                !txSuccess?.value?.confirmationStatus ||
                !["confirmed", "finalized"].includes(
                    txSuccess.value.confirmationStatus
                )
            ) {
                // TX not found
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR04",
                });
            }

            const pulledTx = await connection.getTransaction(tx, {
                maxSupportedTransactionVersion: 1,
            });
            console.log("pulledTx", pulledTx);
            if (!pulledTx?.meta?.logMessages) {
                // Invalid TX, Could not parse Tx, could not find meta, could not find log messages
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR05",
                });
            }
            if (!!pulledTx.meta.err) {
                // TX failed
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR06",
                    cause: pulledTx.meta.err,
                });
            }
            const executesInstructionIndex =
                pulledTx.meta.logMessages?.findIndex((log) =>
                    log.includes("Program log: Instruction: BuyOrSell")
                );
            const finalNumLog =
                executesInstructionIndex !== -1
                    ? pulledTx.meta.logMessages?.findIndex((log, index) => {
                          if (index < executesInstructionIndex) return false;
                          return isBuy
                              ? log.includes("Program log: Bought Tokens:")
                              : log.includes("Program log: Tokens:");
                      }) || -1
                    : -1;
            const wasSuccessful =
                finalNumLog != -1
                    ? pulledTx.meta.logMessages?.findIndex(
                          (log) =>
                              log ===
                              "Program HcuMHMV2iySZmGGGNvtZYaDGF1W2hJPuDzkWKajMrhJx success"
                      ) || -1
                    : -1;
            if (
                finalNumLog === -1 ||
                executesInstructionIndex === -1 ||
                wasSuccessful === -1
            ) {
                // either not finalNumLog or
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR07",
                });
            }
            const nums = pulledTx.meta.logMessages?.[finalNumLog].match(/\d+/g);
            if (!nums) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR08",
                });
            }
            const bigNums = nums.map((num) => BigInt(num));
            const instructions = compact(
                pulledTx.transaction.message.compiledInstructions.map((ix) =>
                    decodeInstruction(ix.data, DwdiPrograms)
                )
            );
            const instruction = instructions[0];
            if (instruction.name !== "buyOrSell") {
                // INVALID TX INSTRUCTION
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR09",
                });
            }
            if (
                (type === "buy" && !instruction.data.buyOrSell) ||
                (type === "sell" && instruction.data.buyOrSell)
            ) {
                // INVALID TX type
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "TRR10",
                });
            }

            let user = await prisma.users.findFirst({
                where: {
                    wallet: wallet,
                },
            });
            if (!user) {
                user = await prisma.users.create({
                    data: {
                        wallet: wallet,
                        signature: "ANON",
                    },
                });
            }

            const program = new Program<IDLType>(DwdiPrograms, { connection });
            const raiseAccount = PublicKey.findProgramAddressSync(
                [Buffer.from("curve"), new PublicKey(input.token).toBuffer()],
                new PublicKey(DwdiPrograms.address)
            )[0];
            const raiseData = await program.account.bondingCurve.fetch(
                raiseAccount
            );

            const trade = await prisma.trades.create({
                data: {
                    raise_id: raise.id,
                    user_id: user.id,
                    amount_in: isBuy ? bigNums[1] : bigNums[0],
                    amount_out: isBuy ? bigNums[0] : bigNums[1],
                    // give this 18 decimals even though it's 9 for SOL
                    end_price: BigInt(
                        Math.floor(
                            getPrice(
                                parseInt(bigNums[2].toString()) / 1e9,
                                raiseData.a,
                                raiseData.b
                            ) * 1e18
                        )
                    ),
                    type: type,
                },
            });
            await prisma.txs_used.create({
                data: {
                    action: type,
                    tx: tx,
                },
            });

            const parsedTrade: any = {};
            Object.keys(trade).map((key) => {
                const val = trade[key as keyof typeof trade];
                parsedTrade[key] =
                    typeof val === "bigint" ? val.toString() : val;
            });

            return {
                trade: parsedTrade,
            };
        }),
    getRaiseChartData: publicProcedure
        .input(z.string().refine((val) => PublicKey.isOnCurve(val)))
        .query(async ({ input }) => {
            const trades = await prisma.trades.findMany({
                select: {
                    created_at: true,
                    type: true,
                    amount_in: true,
                    amount_out: true,
                    end_price: true,
                    users: {
                        select: {
                            username: true,
                            wallet: true,
                        },
                    },
                },
                where: {
                    raises: {
                        token_mint_address: input,
                    },
                },
            });
            if (!trades || trades.length === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "RD01",
                });
            }
            return trades.map((trade) => ({
                time: trade.created_at,
                type: trade.type,

                amount_in: trade.amount_in.toString(),
                amount_out: trade.amount_out.toString(),
                end_price: trade.end_price.toString(),
                user: trade.users?.username || trade.users?.wallet || "????",
            }));
        }),
    getRaiseVolume: publicProcedure
        .input(z.string().refine((val) => PublicKey.isOnCurve(val)))
        .query(async ({ input }) => {
            const currentTime = new Date().getTime() - 3600 * 24 * 1000;
            const trades = await prisma.trades.findMany({
                where: {
                    raises: { token_mint_address: input },
                    created_at: {
                        gte: new Date(currentTime),
                    },
                },
            });
            return trades
                .reduce((acc, trade) => {
                    if (trade.type === "buy") {
                        return acc + BigInt(trade.amount_in);
                    } else {
                        return acc + BigInt(trade.amount_out);
                    }
                }, BigInt(0))
                .toString();
        }),
});

export default tokenRaiseRouter;

type TokenAccountsReturn = {
    address: string;
    mint: string;
    owner: string;
    frozen: boolean;
    amount: number;
};

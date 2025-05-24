import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { PublicKey } from "@solana/web3.js";
import { prisma } from "@/prisma/client";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { TRPCError } from "@trpc/server";

type StringifyBigInts<T> = T extends Date
    ? string
    : T extends bigint
    ? string
    : T extends (infer U)[]
    ? StringifyBigInts<U>[]
    : T extends object
    ? { [K in keyof T]: StringifyBigInts<T[K]> }
    : T;

function stringifyBigInts<T>(obj: T): StringifyBigInts<T> {
    if (typeof obj === "bigint") {
        return obj.toString() as StringifyBigInts<T>;
    } else if (obj instanceof Date) {
        return obj.toISOString() as StringifyBigInts<T>;
    } else if (Array.isArray(obj)) {
        return obj.map(stringifyBigInts) as StringifyBigInts<T>;
    } else if (typeof obj === "object" && obj !== null) {
        return Object.keys(obj).reduce((acc, key) => {
            (acc as any)[key] = stringifyBigInts(obj[key as keyof T]);
            return acc;
        }, {} as StringifyBigInts<T>);
    }
    return obj as StringifyBigInts<T>;
}

const homeRouter = router({
    getLatestBuys: publicProcedure.query(async () => {
        const buys = await prisma.trades.findMany({
            select: {
                amount_in: true,
                raises: {
                    select: {
                        token_mint_address: true,
                        token_ticker: true,
                        img_url: true,
                    },
                },
                id: true,
                created_at: true,
            },
            where: { type: "buy" },
            orderBy: { created_at: "desc" },
            take: 5,
        });

        return stringifyBigInts(buys);
    }),

    getLatestSells: publicProcedure.query(async () => {
        const sells = await prisma.trades.findMany({
            select: {
                amount_out: true,
                raises: {
                    select: {
                        token_mint_address: true,
                        token_ticker: true,
                        img_url: true,
                    },
                },
                id: true,
                created_at: true,
            },
            where: { type: "sell" },
            orderBy: { created_at: "desc" },
            take: 5,
        });

        // const parsedSells: any = {};
        // Object.keys(sells).forEach((key) => {
        //     const val = sells[key as keyof typeof sells];
        //     parsedSells[key] = typeof val === "bigint" ? val as unknown as string : val;
        // });

        // return parsedSells

        return stringifyBigInts(sells);
    }),

    getLatestChats: publicProcedure.query(async () => {
        const latestRaisesWithChats = await prisma.raiseChat.findMany({
            select: {
                raise: {
                    select: {
                        token_mint_address: true,
                        token_ticker: true,
                        img_url: true,
                        _count: {
                            select: {
                                chats: true,
                            },
                        },
                    },
                },
            },
            distinct: "raise_id",
            orderBy: { created_at: "desc" },
            take: 5,
        });

        return latestRaisesWithChats;
    }),

    getAllRaises: publicProcedure
        .input(
            z.object({
                page: z.number().default(1),
                itemsPerPage: z.number().default(6),
            })
        )
        .query(async ({ input }) => {
            const { page, itemsPerPage } = input;

            const skip = (page - 1) * itemsPerPage;

            const [raises, totalRaises] = await prisma.$transaction([
                prisma.raises.findMany({
                    where: {
                        users: {
                            wallet: {
                                not: undefined,
                            },
                        },
                    },
                    include: {
                        users: true,
                        tags: true,
                        trades: true,
                        chats: true,
                    },
                    orderBy: { updated_at: "desc" },
                    skip,
                    take: itemsPerPage,
                }),
                prisma.raises.count(),
            ]);

            const parsedRaises = stringifyBigInts(raises);

            return { raises: parsedRaises, totalRaises };
        }),
});

export default homeRouter;

import { z } from "zod";
import { mergeRouters, publicProcedure, router } from "./trpc";
import { shadowDriveClientAndPkey } from "./utils";
import { TRPCError } from "@trpc/server";

import { prisma } from "@/prisma/client";
// other routers
import userRouter from "./userRouter";
import tokenRaiseRouter from "./tokenRaiseRouter";
import homeRouter from "./homepageRouter";
import chatRouter from "./chatRouter";

const metadataRouter = router({
    uploadTokenImageAndMeta: publicProcedure
        .input(
            z.object({
                name: z.string(),
                ticker: z.string(),
                description: z.string(),
                image: z.string().transform((val) => {
                    const buffer = Buffer.from(val, "base64");
                    return buffer;
                }),
                imageFormat: z
                    .string()
                    .regex(
                        new RegExp(/^(jpg|jpeg|png|gif|bmp|webp|svg)$/i),
                        "Invalid image format"
                    ),
                creator: z.string(),
            })
        )
        .output(
            z.object({
                metadataURI: z.string().url(),
                metadata: z.object({
                    name: z.string(),
                    symbol: z.string(),
                    description: z.string(),
                    image: z.string().url(),
                }),
            })
        )
        .mutation(async (input) => {
            if (
                !process.env.BACKEND_SOLANA_RPC ||
                !process.env.BACKEND_TEST_SOLANA_RPC
            ) {
                throw new TRPCError({
                    code: "NOT_IMPLEMENTED",
                    message: "RPC is not set",
                });
            }
            const { drive, key } = await shadowDriveClientAndPkey();
            console.log("Drive and key obtained", { drive, key });
            const imageName = `${input.input.ticker}.${input.input.imageFormat}`;
            // UPLOAD IMAGE
            const file = await drive.uploadFile(key, {
                name: imageName,
                file: input.input.image,
            });
            // create METADATA FILE
            const metadata = {
                name: input.input.name,
                symbol: input.input.ticker,
                description: input.input.description,
                image: file.finalized_locations[0],
            };
            const metadataBuffer = Buffer.from(JSON.stringify(metadata));
            const metadataName = `${input.input.ticker}.json`;
            // UPLOAD METADATA
            const metadataFile = await drive.uploadFile(key, {
                name: metadataName,
                file: metadataBuffer,
            });

            // return metadata and Instructions to create token and curve
            const metadataURI = metadataFile.finalized_locations[0];
            return {
                metadataURI,
                metadata,
            };
        }),

    verifyCreateCurve: publicProcedure
        .input(
            z.object({
                tx: z.string(),
                tokenAddress: z.string(),
                tokenMetadata: z.object({
                    name: z.string(),
                    ticker: z.string(),
                    imageURL: z.string().url(),
                    metadataURL: z.string().url(),
                }),
                socials: z.array(
                    z.string().regex(
                        new RegExp(
                            /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
                        ), // Regex to check form name:url
                        "Invalid format, expected name:url"
                    )
                ),
                creator: z.string(),
            })
        )
        .mutation(async (input) => {
            const { tx, creator } = input.input;
            // check if tx already exists
            const txExists = await prisma.txs_used.findFirst({
                where: { tx: tx },
            });
            if (txExists) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Transaction already exists",
                });
            }
            // Check if wallet already exists
            let wallet = await prisma.users.findFirst({
                where: { wallet: creator },
            });
            if (!wallet) {
                // create user with random name
                wallet = await prisma.users.create({
                    data: {
                        wallet: creator,
                        username: null,
                        signature: "ANON",
                        dev_points: 0,
                        user_points: 0,
                    },
                });
            }
            // set tx as used
            await prisma.txs_used.create({
                data: {
                    tx,
                    action: "create_token_and_curve",
                },
            });
            // add curve and token to table
            await prisma.raises.create({
                data: {
                    users: {
                        connect: {
                            id: wallet.id,
                        },
                    },
                    metadata_url: input.input.tokenMetadata.metadataURL,
                    token_mint_address: input.input.tokenAddress,
                    token_name: input.input.tokenMetadata.name,
                    token_ticker: input.input.tokenMetadata.ticker,
                    img_url: input.input.tokenMetadata.imageURL,
                    socials: input.input.socials,
                },
            });

            return {
                msg: "Transaction verified",
            };
        }),
});

export const appRouter = mergeRouters(
    metadataRouter,
    userRouter,
    tokenRaiseRouter,
    homeRouter,
    chatRouter
);
export type AppRouter = typeof appRouter;

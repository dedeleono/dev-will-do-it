// trpc.ts
import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { prisma } from "@/prisma/client";
import { PublicKey } from "@solana/web3.js";
import { TRPCError } from "@trpc/server";

const chatRouter = router({
    sendMessage: publicProcedure
        .input(z.object({
            token: z.string().refine( val => PublicKey.isOnCurve(val)),
            wallet: z.string().refine( val => PublicKey.isOnCurve(val)),
            message: z.string(),
            cursor: z.number().nullish()
        }))
        .mutation(async ({ input }) => {
            const { token, wallet, message, cursor } = input;
            let tokenRaise = await prisma.raises.findFirst({
                where: {
                    token_mint_address: token,
                }
            })
            if(!tokenRaise)
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Token raise not found",
                })

            let user = await prisma.users.findFirst({
                where: {
                    wallet: wallet,
                },
            });
            // if not a user, create user
            if(!user){
               user = await prisma.users.create({
                    data: { 
                        wallet: wallet,
                        signature: "ANON",
                        username: null,
                        dev_points: 0,
                        user_points: 0,
                        profile_img: null,
                        socials: [],
                        bio: null,
                    }
                })
            }

            const newMessage = {
                raise_id: tokenRaise.id,
                user_id: user.id,
                message,
                created_at: new Date(), // Add created_at for consistent data
            };

            // Save the message in the database asynchronously
            await prisma.raiseChat.create({
                data: newMessage,
            });

            const messagesFromCursor = await prisma.raiseChat.findMany({
                select: {
                    id: true,
                    message: true,
                    created_at: true,
                    users: {
                        select: {
                            username: true,
                            wallet: true,
                            profile_img: true,
                        }
                    }
                },
                where: {
                    raise_id: tokenRaise.id,
                    id: {
                        gt: cursor || 0
                    }
                },
                orderBy: {
                    created_at: "asc",
                },
            })

            return {
                pendingMessages: messagesFromCursor,
                cursor: messagesFromCursor[messagesFromCursor.length - 1].id,
            };
        }),

    getMessages: publicProcedure
        .input(
            z.object({
                mint: z.string().refine((val) => PublicKey.isOnCurve(val)),
                // cursor is the ID of the latest chat
                cursor: z.number().nullish()
            })
        )
        .query(async ({ input }) => {

            const { mint, cursor} = input;

            // Fetch messages for the raise_id
            const messages = await prisma.raiseChat.findMany({
                select: {
                    id: true,
                    message: true,
                    created_at: true,
                    users: {
                        select: {
                            username: true,
                            wallet: true,
                            profile_img: true,
                        }
                    }
                },
                where: {
                        raise: {
                            token_mint_address: mint
                        },
                        id: {
                            gt: cursor || 0
                        }
                },
                orderBy: {
                    created_at: "asc",
                },
            });

            return {
                messages,
                cursor: messages[messages.length - 1]?.id || 0,
            };
        }),
});

export default chatRouter
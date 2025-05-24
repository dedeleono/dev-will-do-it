import { z } from "zod";
import { router, publicProcedure } from "./trpc";
import { PublicKey } from "@solana/web3.js";
import { prisma } from "@/prisma/client";
import { Prisma } from "@prisma/client";
import bs58 from 'bs58'
import nacl from "tweetnacl";
import { TRPCError } from "@trpc/server";
import { shadowDriveClientAndPkey } from "./utils";
import intersection from 'lodash/intersection'

const userRouter = router({
  getUserByUserName: publicProcedure.input(z.string()).query(async ({input}) => {
    const user = await prisma.users.findFirst({
        select: {
          username: true,
          profile_img: true,
          wallet: true,
          dev_points: true,
          user_points: true,
          socials: true,
          bio: true,
          raises: {
            select: {
              token_name: true,
              token_ticker: true,
              token_mint_address: true,
              tags: true, 
              img_url: true,        
            },
          },
        },
        where: {
          username: input,
        },
      });
      if(!user)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      return user;
    }
  ),
  getUserByPK: publicProcedure
    .input(
      z.string().refine(
        (val) => {
          const pk = new PublicKey(val);
          return PublicKey.isOnCurve(pk);
        },
        {
          message: "Invalid Solana PublicKey",
        }
      )
    )
    .query(async ({ input }) => {
      console.log("Wallet Public Key:", input);
      let user = await prisma.users.findFirst({
        select: {
          id: true,
          username: true,
          profile_img: true,
          wallet: true,
          dev_points: true,
          user_points: true,
          socials: true,
          bio: true,
          raises: {
            select: {
              token_name: true,
              token_ticker: true,
              token_mint_address: true,
              tags: true, 
              img_url: true,        
            },
          },
        },
        where: {
          wallet: input,
        },
      });
      if (!user) {
        user = await prisma.users.create({
          data: {
            wallet: input,
            username: null, // Set default values
            dev_points: 0,
            user_points: 0,
            profile_img: null,
            socials: [],
            bio: "",
            signature: "anon"
          },
          select: {
            id: true,
            username: true,
            profile_img: true,
            wallet: true,
            dev_points: true,
            user_points: true,
            socials: true,
            bio: true,
            raises: {
              select: {
                token_name: true,
                token_ticker: true,
                token_mint_address: true,
                tags: true,
                img_url: true,
              },
            },
          },
        });
      }
      return user;
    }),
  checkUserExists: publicProcedure
    .input(
      z.object({
      username: z
          .string()
      })
    )
    .query(async ({ input }) => {
      const user = await prisma.users.findFirst({
        where: {
          username: input.username,
        },
      });
      return !!user;
    }),
  updateUser: publicProcedure
    .input(
      z.object({
        signatureTime: z.number(),
        updateSignature: z.string().refine( val => bs58.decode(val).length > 0), //validation that wallet actually changed the data.
        wallet: z.string().refine(
          (val) => {
            const pk = new PublicKey(val);
            return PublicKey.isOnCurve(pk);
          },
          {
            message: "Invalid Solana PublicKey",
          }
        ),
        username: z
          .string()
          .nullish()
          .refine((val) => !val || val.length > 6),
        bio: z
          .string()
          .nullish()
          .refine((val) => !val || val.length > 6),
          socials: z.array(
            z.string().regex(
              new RegExp(
                /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
              ), // Regex to check form name:url
              "Invalid format, expected name:url"
            )
          ).nullish(),
        image: z.string().transform((val) => {
          const buffer = Buffer.from(val, "base64");
          return buffer;
        }).nullish(),
        imageFormat: z
          .string()
          .regex(
            new RegExp(/^(jpg|jpeg|png|gif|bmp|webp|svg)$/i),
            "Invalid image format"
          ),
      })
    )
    .mutation(async ({ input }) => {
      /**
       * UpdateSignature = {
       *    message: "I acknowledge that I want to edit my user with"
       *    edits: {
       *      newUsername: username,
       *      newImage: imageString,    
       *    }
       * }
       */
      

      const {updateSignature, wallet, username, image, signatureTime, socials, bio, imageFormat} = input;

      const { drive, key } = await shadowDriveClientAndPkey();
      console.log("Drive and key obtained", { drive, key });

      const imageName = `${input.username}.${input.imageFormat}`;
      // UPLOAD IMAGE
      let profileImage: undefined|  null | string = undefined
      if(image){
        const file = await drive.uploadFile(key, {
          name: imageName,
          file: image,
        });
        profileImage = file.finalized_locations[0]
      }


      const pk = new PublicKey(wallet);


      // Parse the signatureTime to a Date object
      const signatureDate = new Date(signatureTime * 1000);

      // Get the current time
      const currentTime = new Date();

      // Calculate the difference in milliseconds
      const timeDifference = currentTime.getTime() - signatureDate.getTime();

      // Check if the difference is less than 5 minutes (300,000 milliseconds)
      const signatureTimeIsValid = timeDifference < 300000;

      if (!signatureTimeIsValid) {
        throw new Error("Signature time is invalid or too old.");
      }
     if(signatureTimeIsValid) {


      const edits = {
        newUserName: username || undefined,
        newImage: profileImage ? "new."+input.imageFormat : undefined,
        newSocials: socials || undefined,
        newBio: bio || undefined,
        dateAndTime: signatureTime
      }
      const hasValidSignature = nacl.sign.detached.verify(
        new TextEncoder().encode(
          JSON.stringify({
           message: "I acknowledge that I want to edit my user with",
           edits: edits,
        })
        ),
        bs58.decode(updateSignature),
        pk.toBytes()
      );

      if(!hasValidSignature) {
        throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid Signature",
                });
      }

      // check if wallet already exists
      const walletExists = await prisma.users.findFirst({
        select: {
          socials: true
        },
        where: { wallet: wallet },
      });


      // const updateSocials = (user: Prisma.Prisma__usersClient<{socials}>, socials: string[]) =>{
      //   if(!user.socials) {
      //     user.socials = {};
      //   }
      
      //   for (const [key, value] of Object.entries(socials)) {
      //     user.socials[key] = value; 
      //   }
      // }


      if(walletExists) {

          let walletSocials = walletExists.socials.map( social => social.split(":")[0])
          const newSocials = socials?.map( social => social.split(":")[0]) || []
          const repeatSocials = intersection(walletSocials, newSocials)
          if(socials && repeatSocials.length > 0){
            walletSocials = walletExists.socials.filter(social => {
              return !repeatSocials.includes(social.split(":")[0])
            })
            .concat(socials)
          }

          const updateData: Prisma.usersUpdateInput = {
            username: username || undefined,
            profile_img: profileImage || undefined,
            socials: socials ? walletSocials : undefined,
            bio: bio || undefined,
          }
          await prisma.users.update({
            where: { wallet: wallet },
            data: updateData
          });
        } else {
          
          const createData: Prisma.usersCreateInput = {
            wallet: wallet,
            username: username,
            profile_img: profileImage || undefined,
            signature: updateSignature,
            dev_points: 0,
            user_points: 0,
            socials: socials || undefined,
            bio: bio,
          }

          await prisma.users.create({
            data: createData
          });
        }
     }

      return {
        username: username ,
        image: image,
        socials: socials,
        bio: bio,
      };
    }),
});

export default userRouter;

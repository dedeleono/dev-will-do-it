"use client";
/* Nextjs */
import Image, { StaticImageData } from "next/image";
import { motion } from "framer-motion";

/* Shadcn */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import WalletMultiButtonStyled from "@/components/ui/walletBtn";

/* Dependencies */
import { FaChevronRight } from "react-icons/fa";
import FotoEditComponent from "@/components/FotoEditComponent";
import { RingsLoader } from "@/components/shared/Loaders";
/* trpc */
import { trpc } from "@/app/_trpc/client";

import { useWallet } from "@solana/wallet-adapter-react";
import { PageBody } from "./_components/PageBody";

export default function ProfilePage() {
  const wallet = useWallet();

  if (!wallet.connected || !wallet.publicKey) {
    return (
      <main>
        <div className="flex flex-col items-center py-10">
          <h1 className="font-talk text-3xl pb-5 text-center">
            Connect your wallet
          </h1>
          <WalletMultiButtonStyled />
        </div>
      </main>
    );
  }

  const {
    data: userData,
    refetch,
    isLoading,
  } = trpc.getUserByPK.useQuery(wallet.publicKey.toBase58());

  console.log(userData);

  return (
    <PageBody
      isLoading={isLoading}
      userData={userData}
      refetch={refetch}
      isOwner={true}
    />
  );
}

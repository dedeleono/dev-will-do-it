"use client";
/* trpc */
import { trpc } from "@/app/_trpc/client";
import { PageBody } from "../_components/PageBody";
import { todo } from "node:test";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export default function ProfilePage({
  params,
}: {
  params: { profile: string };
}) {
  const { publicKey } = useWallet();
  //@todo comparar wallet con profile para ver si es el owner
  const profile = decodeURIComponent(params.profile);
  const {
    data: userData,
    error,
    refetch,
    isLoading,
  } = trpc.getUserByUserName.useQuery(profile);
  console.log({ userData });

  const isOwner = useMemo(() => {
    if (!publicKey || !userData?.wallet) return false;
    return publicKey.toBase58() === userData.wallet;
  }, [publicKey, userData?.wallet]);

  if (error)
    return (
      <div className="py-10 text-5xl font-talk text-center">User Not found</div>
    );
  return (
    <div>
      <PageBody
        isLoading={isLoading}
        userData={userData}
        refetch={refetch}
        isOwner={isOwner}
      />
    </div>
  );
}

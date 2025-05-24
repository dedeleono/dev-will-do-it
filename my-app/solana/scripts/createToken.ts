import {
  createAndMint,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createNoopSigner,
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import { createSetAuthorityInstruction } from "@solana/spl-token";
import { PublicKey, Keypair } from "@solana/web3.js";

type SPLMetadataType = {
  name: string;
  symbol: string;
  image: string;
};

export const createToken = async (
  metadata: SPLMetadataType,
  uri: string,
  signer: string,
  connectionURL: string
) => {
  if (!process.env.NEXT_PUBLIC_SOLANA_RPC) {
    throw new Error("No Solana RPC found");
  }
  const frontendSigner = createNoopSigner(publicKey(signer));
  const umi = createUmi(connectionURL);
  const mint = generateSigner(umi);
  umi.use(keypairIdentity(mint));
  umi.use(mplTokenMetadata());

  console.log("Creating token and instructions");

  const ixs = createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: metadata.name,
    symbol: metadata.symbol,
    payer: frontendSigner,
    uri: uri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 9,
    amount: 1_000_000_000_000000000,
    tokenOwner: frontendSigner.publicKey,
    tokenStandard: TokenStandard.Fungible,
    isMutable: false,
  })
    .getInstructions()
    .map(toWeb3JsInstruction);

  ixs.push(
    createSetAuthorityInstruction(
      new PublicKey(mint.publicKey),
      new PublicKey(mint.publicKey),
      0,
      null
    ),
    createSetAuthorityInstruction(
      new PublicKey(mint.publicKey),
      new PublicKey(mint.publicKey),
      1,
      null
    )
  );

  const mintSigner = Keypair.fromSecretKey(mint.secretKey);

  return {
    instructions: ixs,
    mintSigner,
  };
};

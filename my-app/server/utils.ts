import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { ShdwDrive } from "@shadow-drive/sdk";
import { DwdiPrograms, IDLType } from "@/lib/CurveIDL";
import bs58 from "bs58";

const web3 = anchor.web3;

export async function shadowDriveClientAndPkey() {
    if (!process.env.SHDW_WALLET || !process.env.BACKEND_SOLANA_RPC) {
        throw new Error("Missing ENV is not set");
    }
    let keypair = web3.Keypair.fromSecretKey(
        Uint8Array.from(bs58.decode(process.env.SHDW_WALLET))
    );
    const connection = new web3.Connection(
        process.env.BACKEND_SOLANA_RPC,
        "confirmed"
    );
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();
    const accts = await drive.getStorageAccounts();
    return { drive, key: accts[0].publicKey };
}
function readUint64LE(data: Uint8Array, offset: number): bigint {
    let value = 0n;
    for (let i = 0; i < 8; i++) {
        value += BigInt(data[offset + i]) << BigInt(8 * i);
    }
    return value;
}

export function decodeInstruction(instructionData: Uint8Array, idl: IDLType) {
    const discriminator = instructionData.slice(0, 8);
    // get the instruction name
    const instructionFound = idl.instructions.find(
        (ix) =>
            Uint8Array.from(ix.discriminator).toString() ===
            Uint8Array.from(discriminator).toString()
    );
    const data = instructionData.slice(8);

    if (!instructionFound) return null;

    const args: { [key: string]: any } = {};
    let offset = 0;
    for (const arg of instructionFound?.args) {
        switch (arg.type) {
            case "u64":
                args[arg.name] = readUint64LE(data, offset).toString();
                offset += 8;
                break;
            case "bool":
                args[arg.name] = data[offset] !== 0;
                offset += 1;
                break;
            // Add more types as needed
            default:
                throw new Error(`Unsupported argument type: ${arg.type}`);
        }
    }

    return {
        name: instructionFound.name,
        data: args,
    };
}

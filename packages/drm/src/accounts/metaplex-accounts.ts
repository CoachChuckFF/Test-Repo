import { web3 } from "@project-serum/anchor";
import { METAPLEX_METADATA_ID } from "../models/program-ids";
import * as MPL from "@metaplex-foundation/js";
import * as SPL from "@solana/spl-token";

export interface MetaplexMetadata {
    name: string;
    symbol: string;
    description: string;
    seller_fee_basis_points: number; // always 0
    image: string; // image uri
    animation_url: string; // not used
    external_url: string; // excal.tv/userid or media id
    attributes?: MetaplexMetadataAttribute[];
    collection?: MetaplexMetadataCollection;
    properties?: MetaplexMetadataProperties;
}

export interface MetaplexMetadataAttribute {
    trait_type: string;
    value: string;
}

export interface MetaplexMetadataCollection {
    name: string;
    family: string;
}

export interface MetaplexMetadataProperties {
    files: MetaplexMetadataFiles[];
    category: string;
    creators?: MetaplexMetadataCreators[];
}

export interface MetaplexMetadataFiles {
    uri: string;
    type: string;
    cdn?: boolean;
}

export interface MetaplexMetadataCreators {
    address: string;
    share: number;
}

/**
 * Returns the ATA ( Associated Token Account ) for the given mint and owner
 *
 * @param mint Mint public key
 * @param owner Owner of ATA
 * @param ownerIsDataAccount True if using with a Program Account
 * @returns ATA Public Key
 */
export function getVaultKey(
    mint: web3.PublicKey,
    owner: web3.PublicKey,
    ownerIsDataAccount?: boolean
) {
    return MPL.findAssociatedTokenAccountPda(
        mint,
        owner
        // ownerIsDataAccount
    );
    // return SPL.Token.getAssociatedTokenAddress(
    //     SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
    //     SPL.TOKEN_PROGRAM_ID,
    //     mint,
    //     owner,
    //     ownerIsDataAccount
    // );
}

export async function fetchMetadata(
    connection: web3.Connection,
    metadata: web3.PublicKey
) {
    const rawAccount = await connection.getAccountInfo(metadata);
    if (!rawAccount) throw new Error("Account needs to be fetched");

    return MPL.toMetadataAccount({
        publicKey: metadata,
        executable: rawAccount.executable,
        owner: rawAccount.owner,
        lamports: rawAccount.lamports,
        data: rawAccount.data,
    }).data;
}

export function getMetadataKey(mint: web3.PublicKey) {
    return web3.PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            METAPLEX_METADATA_ID.toBuffer(),
            mint.toBuffer(),
        ],
        METAPLEX_METADATA_ID
    );
}

export function getMetadataEditionKey(mint: web3.PublicKey) {
    return web3.PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            METAPLEX_METADATA_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
        ],
        METAPLEX_METADATA_ID
    );
}

import { web3, Idl } from "@project-serum/anchor";
import { TokenMetadataProgram } from "@metaplex-foundation/js";
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
const IDL = require("../../target/idl/excalibur_drm.json");

export const EXCALIBUR_DRM_IDL = IDL as Idl;

export const EXCALIBUR_DRM_ID = new web3.PublicKey(
    EXCALIBUR_DRM_IDL.metadata.address
);
export const METAPLEX_METADATA_ID = TokenMetadataProgram.publicKey;
export const SYSTEM_RENT_ID = web3.SYSVAR_RENT_PUBKEY;
export const SYSTEM_ID = web3.SystemProgram.programId;
export const TOKEN_ID = TOKEN_PROGRAM_ID;
export const ASSOCIATED_TOKEN_ID = ASSOCIATED_TOKEN_PROGRAM_ID;

import { web3, BN } from "@project-serum/anchor";

export const CONTRIBUTOR_HASH = "CONTRIBUTOR";
export const AFFILAITE_HASH = "AFFILIATE";
export const MEDIA_HASH = "MEDIA";
export const USER_HASH = "USER";

export const DEFAULT_CONTRIBUTION_SOLANA = 0.1; // In Solana
export const DEFAULT_CONTRIBUTION = new BN(
    DEFAULT_CONTRIBUTION_SOLANA / web3.LAMPORTS_PER_SOL
); // In Lamports

export const DEFAULT_TOLL_PERCENTAGE = 0.05; // In percent

export function getToll(lamports: BN) {
    return new BN(lamports.toNumber() * (1 - DEFAULT_TOLL_PERCENTAGE));
}

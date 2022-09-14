use crate::excal_globals::constants::*;
use anchor_lang::prelude::*;

/// ContributorAccount
/// PDA: CONTRIBUTOR_SEED | Contributor | [ Original Media | User Account ]
///
/// Needed for minting NFT
///
#[account]
pub struct ContributorAccount {
    pub creation_date: u64,
    pub last_contributed: u64,
    pub lamports_total: u64,
    pub contributor: Pubkey,
    pub original_media_or_user_account: Pubkey, // User Account - or - Media Account
}
pub fn get_contributor_size() -> usize {
    return ACCOUNT_DISCRIMINATOR_SIZE + // Account
        U64_SIZE + // Creation Date
        U64_SIZE + // Last Contributed
        U64_SIZE + // Lamports Total
        PUBKEY_SIZE + // Contributor - person who made the contribution
        PUBKEY_SIZE; // Original Media or User Account
}

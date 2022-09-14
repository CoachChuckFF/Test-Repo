use crate::excal_globals::constants::*;
use anchor_lang::prelude::*;

/// MediaHashAccount
/// PDA: Hash of the media file
///
/// Will stop multiple creations of the same media
///
#[account]
pub struct MediaHashAccount {
    pub user_account: Pubkey,
    pub creation_date: u64,
}
pub fn get_media_hash_size() -> usize {
    return ACCOUNT_DISCRIMINATOR_SIZE + // Account
        PUBKEY_SIZE + // User Account
        U64_SIZE; // Creation Date
}

use crate::excal_globals::constants::*;
use anchor_lang::prelude::*;

/// UserAccount
/// PDA: USER_SEED | owner
///
/// Master edition and collection NFT
///
#[account]
pub struct UserAccount {
    pub bump: u8,
    pub creation_date: u64,
    pub owner: Pubkey,
    pub collection_mint: Pubkey,
    pub collection_metadata: Pubkey,
    pub collection_master_edition: Pubkey,

    pub media_creation_count: u64, // +1 for each media created

    pub lamports_total: u64,
    pub toll_to_distribute: u64,
    pub toll_total: u64,

    pub eternalized: bool, // Can account be deleted / changed
    pub shdw_storage: Pubkey,
}
pub fn get_user_size() -> usize {
    return ACCOUNT_DISCRIMINATOR_SIZE + // Account
        U8_SIZE + // Bump
        U64_SIZE + // Creation Date
        PUBKEY_SIZE + // Owner
        PUBKEY_SIZE + // Collection Mint
        PUBKEY_SIZE + // Collection Metadata
        PUBKEY_SIZE + // Collection Master Edition
        U64_SIZE + // Media Creation Count
        U64_SIZE + // Lamports Total
        U64_SIZE + // Toll To Distribute
        U64_SIZE + // Toll Total
        U8_SIZE + // Eternalized
        PUBKEY_SIZE; // SHDW Storage Key
}

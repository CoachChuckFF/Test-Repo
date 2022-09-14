use crate::excal_globals::constants::*;
use anchor_lang::prelude::*;

/// Media Account
/// PDA Original: MEDIA_SEED | media index | owner
/// PDA Affiliate: AFFILIATE_SEED | original media | owner
///
/// Handles the distro of contrabutions
///
#[account]
pub struct MediaAccount {
    // ------ Original Media -------
    // Original: Self Pointer
    // Affilaite: Pointer to Original
    pub original_media: Pubkey, // Self pointer for original account
    pub original_user: Pubkey,  // Self pointer for original user
    pub original_owner: Pubkey, // Self pointer for original user

    // ------ PDA Details -------
    // Original: Original Creator of the media
    // Affilaite: Affiliate user account
    pub user_account: Pubkey, // User account
    pub owner: Pubkey,        // Owner account

    // ------ Media NFT Details -------
    // Original Only
    pub sft_mint: Pubkey,
    pub shdw_storage: Pubkey,
    pub media_hash: Pubkey,

    // ------ Global State Details -------
    // Original: Original state
    // Affilaite: Affiliate state
    pub media_creation_index: u64, // Index for the account made by the user
    pub creation_date: u64,        // Creation Date
    pub eternalized: bool,         // Can account be deleted / changed
    pub affiliate_split: u64, // Affiliate Split -- //TODO Set SHDW account to eternalize - And set URI of metadata to SHDW key

    // ------ Revenue State Details -------
    // Original: Original state
    // Affilaite: Affiliate state
    pub crank_tally: u64,            // Total times cranked
    pub lamports_to_distribute: u64, // Lamports to be distributed
    pub lamports_total: u64,         // Total lamports contributed
    pub toll_to_distribute: u64,     // Tolls to be distributed
    pub toll_total: u64,             // Total tolls paid
    pub excal_to_distribute: u64,    // Excal to be distributed
    pub excal_total: u64,            // Total Excal Paid

    // Excal Data
    pub for_future_use: [u64; 8], // For future use

    pub worker_distributions: Vec<WorkerDistribution>, // distributions(s)
}
pub fn get_media_size(distro_count: usize) -> usize {
    return ACCOUNT_DISCRIMINATOR_SIZE + // Account
        PUBKEY_SIZE + // Original Media
        PUBKEY_SIZE + // Original User
        PUBKEY_SIZE + // Original Owner
        PUBKEY_SIZE + // User Account
        PUBKEY_SIZE + // Owner Account
        PUBKEY_SIZE + // SFT Mint
        PUBKEY_SIZE + // Shadow Storage
        PUBKEY_SIZE + // Media Hash
        U64_SIZE + // Media Index
        U64_SIZE + // Creation Date
        U8_SIZE + // Eternalized
        U64_SIZE + // Affiliate Split
        U64_SIZE + // Crank Tally
        U64_SIZE + // Lamports to Distribute
        U64_SIZE + // Lamport Total
        U64_SIZE + // Toll to Distribute
        U64_SIZE + // Toll Total
        U64_SIZE + // Excal to Distribute
        U64_SIZE + // Excal Total
        U64_SIZE * 8 + // For Future Use
        VEC_SIZE + (get_worker_distribution_size() * distro_count); // distributions
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct WorkerDistribution {
    pub wallet: Pubkey, // Can also be a User account - which will route automatically
    pub percentage: u64,
    pub lamports_earned: u64,
    pub lamports_distributed: u64,
}
pub fn get_worker_distribution_size() -> usize {
    return PUBKEY_SIZE +            // Wallet
        U64_SIZE +                  // Percentage
        U64_SIZE +                  // Lamports Earned
        U64_SIZE; // Lamports Distributed
}

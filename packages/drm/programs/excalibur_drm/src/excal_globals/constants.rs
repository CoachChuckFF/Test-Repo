// STRUCT SIZES
pub const ACCOUNT_DISCRIMINATOR_SIZE: usize = 8;
pub const PUBKEY_SIZE: usize = 32;
pub const VEC_SIZE: usize = 4;
pub const U64_SIZE: usize = 8;
pub const U16_SIZE: usize = 2;
pub const U8_SIZE: usize = 1;
pub const OPTION_SIZE: usize = 1;
pub const URI_SIZE: usize = 200;
pub const STRING_SIZE: usize = 128;

// MAXES
pub const MAX_PERCENT: u64 = 100 * 100;
pub const HALF_PERCENT: u64 = MAX_PERCENT >> 1;

// HASHES
pub const USER_SEED: &[u8] = b"USER";
pub const MEDIA_SEED: &[u8] = b"MEDIA";
pub const AFFILIATE_SEED: &[u8] = b"AFFILIATE";
pub const CONTRIBUTOR_SEED: &[u8] = b"CONTRIBUTOR";

// WALLETS
pub const EXCALIBUR_COMMUNITY_WALLET: &str = "AF9KTjBhKpoSeVvgZNLUi8EGTN6ftV2yGZQuW5YdHEvy";

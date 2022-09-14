use anchor_lang::prelude::*;

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct NFTParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ContributeParams {
    pub lamports: u64,
    pub toll: u64,
}

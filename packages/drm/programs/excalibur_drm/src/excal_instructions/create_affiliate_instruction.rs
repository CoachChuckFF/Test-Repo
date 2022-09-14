use crate::excal_accounts::media_account::*;
use crate::excal_accounts::user_account::*;
use crate::excal_globals::constants::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent;

#[derive(Accounts)]
pub struct CreateAffiliate<'info> {
    // --------- Accounts ----------
    #[account(mut)]
    pub original_media_account: Box<Account<'info, MediaAccount>>,

    #[account(
        init,
        space = get_media_size(2), // One for Original, one for Affiliate
        payer = owner,
        seeds = [
            AFFILIATE_SEED,
            original_media_account.key().as_ref(),
            owner.key().as_ref(),
        ],
        bump
    )]
    pub affiliate_media_account: Account<'info, MediaAccount>,

    // --------- Exsiting Accounts ----------
    #[account(mut, has_one=owner)]
    pub user_account: Box<Account<'info, UserAccount>>,

    // --------- Programs ----------
    pub system_program: Program<'info, System>,

    // --------- Signers ----------
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn run_create_affiliate(ctx: Context<CreateAffiliate>) -> Result<()> {
    {
        msg!("Set Affiliate Params");

        let affiliate = &mut ctx.accounts.affiliate_media_account;

        affiliate.original_media = ctx.accounts.original_media_account.original_media;
        affiliate.original_user = ctx.accounts.original_media_account.original_user;
        affiliate.original_owner = ctx.accounts.original_media_account.original_owner;

        affiliate.user_account = ctx.accounts.user_account.key();
        affiliate.owner = ctx.accounts.owner.key();

        affiliate.sft_mint = ctx.accounts.original_media_account.sft_mint;
        affiliate.shdw_storage = ctx.accounts.original_media_account.shdw_storage;
        affiliate.media_hash = ctx.accounts.original_media_account.media_hash;

        affiliate.media_creation_index = ctx.accounts.original_media_account.media_creation_index;
        affiliate.creation_date = Clock::get()?.unix_timestamp as u64;
        affiliate.eternalized = false;
        affiliate.affiliate_split = ctx.accounts.original_media_account.affiliate_split;

        affiliate.crank_tally = 0;
        affiliate.lamports_to_distribute = 0;
        affiliate.lamports_total = 0;
        affiliate.toll_to_distribute = 0;
        affiliate.toll_total = 0;
        affiliate.excal_to_distribute = 0;
        affiliate.excal_total = 0;

        // No need to check if MAX_PERCENT > ctx.accounts.original_media_account.affiliate_split as this is done in
        // the create media instruction
        affiliate.worker_distributions.push(WorkerDistribution {
            wallet: ctx.accounts.user_account.key(),
            percentage: MAX_PERCENT - ctx.accounts.original_media_account.affiliate_split,
            lamports_earned: 0,
            lamports_distributed: 0,
        });

        affiliate.worker_distributions.push(WorkerDistribution {
            wallet: ctx.accounts.original_media_account.key(),
            percentage: ctx.accounts.original_media_account.affiliate_split,
            lamports_earned: 0,
            lamports_distributed: 0,
        });
    }

    Ok(())
}

use crate::excal_accounts::media_account::*;
use crate::excal_globals::constants::*;
use anchor_lang::prelude::*;
use std::str::FromStr;

#[derive(Accounts)]
pub struct DistributeToCommunityFromMediaCrank<'info> {
    // --------- Old Accounts ----------
    #[account(mut)]
    pub media_account: Box<Account<'info, MediaAccount>>,

    // --------- Programs ----------
    #[account(mut, address=Pubkey::from_str(EXCALIBUR_COMMUNITY_WALLET).unwrap())]
    /// CHECK: We check it by address here
    pub community_wallet: AccountInfo<'info>,
}

pub fn run_distribute_to_community_from_media_crank(
    ctx: Context<DistributeToCommunityFromMediaCrank>,
) -> Result<()> {
    {
        if ctx.accounts.media_account.toll_total != 0 {
            let media = &mut ctx.accounts.media_account;
            let community_wallet = &mut ctx.accounts.community_wallet;

            let toll_to_collect = media.toll_to_distribute;
            msg!("Collect Toll ( {:?} )", toll_to_collect);

            **media.to_account_info().try_borrow_mut_lamports()? -= toll_to_collect;
            **community_wallet.try_borrow_mut_lamports()? += toll_to_collect;

            media.toll_to_distribute -= toll_to_collect;
        }
    }

    Ok(())
}

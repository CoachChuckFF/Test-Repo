use crate::excal_accounts::user_account::*;
use crate::excal_globals::constants::*;
use anchor_lang::prelude::*;
use std::str::FromStr;

#[derive(Accounts)]
pub struct DistributeToCommunityFromUserCrank<'info> {
    // --------- Old Accounts ----------
    #[account(mut)]
    pub user_account: Box<Account<'info, UserAccount>>,

    // --------- Programs ----------
    #[account(mut, address=Pubkey::from_str(EXCALIBUR_COMMUNITY_WALLET).unwrap())]
    /// CHECK: We check it by address here
    pub community_wallet: AccountInfo<'info>,
}

pub fn run_distribute_to_community_from_user_crank(
    ctx: Context<DistributeToCommunityFromUserCrank>,
) -> Result<()> {
    {
        if ctx.accounts.user_account.toll_total != 0 {
            let user = &mut ctx.accounts.user_account;
            let community_wallet = &mut ctx.accounts.community_wallet;

            let toll_to_collect = user.toll_to_distribute;
            msg!("Collect Toll ( {:?} )", toll_to_collect);

            **user.to_account_info().try_borrow_mut_lamports()? -= toll_to_collect;
            **community_wallet.try_borrow_mut_lamports()? += toll_to_collect;

            user.toll_to_distribute -= toll_to_collect;
        }
    }

    Ok(())
}

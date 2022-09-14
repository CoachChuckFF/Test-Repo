use crate::excal_accounts::user_account::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DistributeToUserCrank<'info> {
    // --------- Old Accounts ----------
    #[account(mut, has_one=owner)]
    pub user_account: Box<Account<'info, UserAccount>>,

    // --------- Programs ----------
    #[account(mut)]
    /// CHECK: We check it by address here
    pub owner: AccountInfo<'info>,
}

pub fn run_distribute_to_user_crank(ctx: Context<DistributeToUserCrank>) -> Result<()> {
    {
        let user = &mut ctx.accounts.user_account;
        let gross_user_lamports = user.to_account_info().lamports();
        let user_rent = Rent::get()?.minimum_balance(get_user_size());

        if gross_user_lamports > user_rent + user.toll_to_distribute {
            let owner = &mut ctx.accounts.owner;

            let distro = gross_user_lamports - user_rent - user.toll_to_distribute;

            **user.to_account_info().try_borrow_mut_lamports()? -= distro;
            **owner.try_borrow_mut_lamports()? += distro;

            user.lamports_total += distro;
        }
    }

    Ok(())
}

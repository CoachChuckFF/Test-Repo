use crate::excal_accounts::contributor_account::*;
use crate::excal_accounts::media_account::*;
use crate::excal_globals::constants::*;
use crate::excal_globals::errors::*;
use crate::excal_globals::parameters::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

#[derive(Accounts)]
pub struct ContributeToMedia<'info> {
    // --------- Old Accounts ----------
    #[account(mut)]
    pub media_account: Box<Account<'info, MediaAccount>>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = get_contributor_size(),
        seeds = [
            CONTRIBUTOR_SEED,
            contributor.key().as_ref(),
            media_account.original_media.as_ref(),
        ],
        bump
    )]
    pub contributor_account: Account<'info, ContributorAccount>,

    // --------- Programs ----------
    pub system_program: Program<'info, System>,
    // --------- Signers ----------
    #[account(mut)]
    pub contributor: Signer<'info>,
}

pub fn run_contribute_to_media(
    ctx: Context<ContributeToMedia>,
    params: ContributeParams,
) -> Result<()> {
    {
        msg!("Check Not Owner");

        // if ctx.accounts.contributor.key() == ctx.accounts.media_account.owner {
        //     return Err(error!(ExcalErrorCode::CannotContributeToYourOwnWork));
        // }

        // if ctx.accounts.contributor.key() == ctx.accounts.media_account.original_owner {
        //     return Err(error!(
        //         ExcalErrorCode::CannotContributeToDerivativeOfYourOwnWork
        //     ));
        // }
    }

    {
        msg!("Contribute Sol");

        let tx_sol_infos = vec![
            ctx.accounts.contributor.to_account_info(),
            ctx.accounts.media_account.to_account_info(),
        ];

        invoke(
            &transfer(
                &ctx.accounts.contributor.key(),
                &ctx.accounts.media_account.key(),
                params.lamports + params.toll,
            ),
            &tx_sol_infos,
        )?;
    }

    {
        msg!("Set Media");
        let media_account = &mut ctx.accounts.media_account;

        media_account.toll_total += params.toll;
        media_account.toll_to_distribute += params.toll;
    }

    {
        msg!("Set Contributor");
        let contributor_account = &mut ctx.accounts.contributor_account;

        contributor_account.contributor = ctx.accounts.contributor.key();
        contributor_account.original_media_or_user_account =
            ctx.accounts.media_account.original_media.key();
        contributor_account.lamports_total += params.lamports;

        contributor_account.last_contributed = Clock::get()?.unix_timestamp as u64;

        if contributor_account.creation_date == 0 {
            contributor_account.creation_date = Clock::get()?.unix_timestamp as u64;
        }
    }

    Ok(())
}

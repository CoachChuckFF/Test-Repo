use crate::excal_accounts::media_account::*;
use crate::excal_accounts::user_account::*;
use crate::excal_globals::constants::*;
use crate::excal_globals::errors::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, Mint, MintTo, Token, TokenAccount};

#[derive(Accounts)]
pub struct PrintSFTFromCreator<'info> {
    // --------- Old Accounts ----------
    #[account(constraint = media_account.original_user == original_user.key())]
    pub original_user: Box<Account<'info, UserAccount>>,

    #[account(has_one=owner)]
    pub media_account: Box<Account<'info, MediaAccount>>,

    #[account(mut, constraint = media_account.sft_mint == sft_mint.key())]
    pub sft_mint: Account<'info, Mint>,

    // --------- New Accounts ----------
    #[account(
        init,
        payer = owner,
        associated_token::mint = sft_mint,
        associated_token::authority = owner,
    )]
    pub owner_vault: Account<'info, TokenAccount>,

    // --------- Programs ----------
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    #[account(address = rent::id())]
    /// CHECK: We check it by address here
    pub rent: AccountInfo<'info>,
    // --------- Signers ----------
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn run_print_sft_from_creator(ctx: Context<PrintSFTFromCreator>) -> Result<()> {
    {
        msg!("Check if someone has contributed");
        if ctx.accounts.media_account.lamports_total == 0 {
            return Err(error!(ExcalErrorCode::NoContributions));
        }
    }

    {
        msg!("Mint to Vault");
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.sft_mint.to_account_info(),
                    to: ctx.accounts.owner_vault.to_account_info(),
                    authority: ctx.accounts.original_user.to_account_info(),
                },
                &[&[
                    USER_SEED,
                    ctx.accounts.original_user.owner.key().as_ref(),
                    &[ctx.accounts.original_user.bump],
                ]],
            ),
            1,
        )?;
    }

    Ok(())
}

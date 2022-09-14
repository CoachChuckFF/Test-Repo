use crate::excal_accounts::user_account::*;
use crate::excal_globals::constants::*;
use crate::excal_globals::parameters::*;
use crate::id;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::sysvar::rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, MintTo};
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::instruction::{create_master_edition_v3, create_metadata_accounts_v3};
use mpl_token_metadata::pda::{find_master_edition_account, find_metadata_account};
use mpl_token_metadata::state::{CollectionDetails, Creator};

#[derive(Accounts)]
pub struct CreateUser<'info> {
    // --------- Accounts ----------
    #[account(
        init,
        space = get_user_size(),
        payer = owner,
        seeds = [
            USER_SEED,
            owner.key().as_ref(),
        ],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = user_account,
        mint::freeze_authority = user_account
    )]
    pub collection_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = owner,
        associated_token::mint = collection_mint,
        associated_token::authority = user_account,
    )]
    pub user_vault: Account<'info, TokenAccount>,

    #[account(mut, address=find_metadata_account(&collection_mint.key()).0)]
    /// CHECK: We check it by address here
    pub collection_metadata: UncheckedAccount<'info>,

    #[account(mut, address=find_master_edition_account(&collection_mint.key()).0)]
    /// CHECK: We check it by address here
    pub collection_master_edition: UncheckedAccount<'info>,

    // --------- Programs ----------
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: We check it by address here
    pub token_metadata_program: UncheckedAccount<'info>,
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

pub fn run_create_user(ctx: Context<CreateUser>, bump: u8, nft_params: NFTParams) -> Result<()> {
    {}

    {
        msg!("Mint to Vault");
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.collection_mint.to_account_info(),
                    to: ctx.accounts.user_vault.to_account_info(),
                    authority: ctx.accounts.user_account.to_account_info(),
                },
                &[&[USER_SEED, ctx.accounts.owner.key().as_ref(), &[bump]]],
            ),
            1,
        )?;
    }

    {
        msg!("Create Metadata");
        let account_info = vec![
            ctx.accounts.collection_metadata.to_account_info(), // Metadata Account
            ctx.accounts.collection_mint.to_account_info(),     // Mint Account
            ctx.accounts.user_account.to_account_info(),        // Mint Authority Account
            ctx.accounts.owner.to_account_info(),               // Payer Account
            ctx.accounts.token_metadata_program.to_account_info(), // Token Metadata Program Account
            ctx.accounts.token_program.to_account_info(),       // Token Program Account
            ctx.accounts.system_program.to_account_info(),      // System Program Account
            ctx.accounts.rent.to_account_info(),                // Rent Account
        ];

        let creator = vec![
            Creator {
                address: ctx.accounts.user_account.key(), // User Account - Because its the signer
                verified: false,
                share: 100,
            },
            Creator {
                address: ctx.accounts.owner.key(), // Owner - For searching
                verified: false,
                share: 0, // Distinction for user vs media
            },
            Creator {
                address: self::id(), // Excalibur - For searching
                verified: false,
                share: 0,
            },
        ];

        invoke_signed(
            &create_metadata_accounts_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.collection_metadata.key(),
                ctx.accounts.collection_mint.key(),
                ctx.accounts.user_account.key(),
                ctx.accounts.owner.key(),
                ctx.accounts.user_account.key(),
                nft_params.name,
                nft_params.symbol,
                nft_params.uri,
                Some(creator),
                0,
                true,
                true,
                None,
                None,
                Some(CollectionDetails::V1 { size: 0 }),
            ),
            account_info.as_slice(),
            &[&[USER_SEED, ctx.accounts.owner.key().as_ref(), &[bump]]],
        )?;
    }

    {
        msg!("Create Master Edition");
        let master_edition_infos = vec![
            ctx.accounts.collection_master_edition.to_account_info(), // Master Edition Account
            ctx.accounts.collection_mint.to_account_info(),           // Mint Account
            ctx.accounts.user_account.to_account_info(),              // Mint Authority Account
            ctx.accounts.owner.to_account_info(),                     // Payer Account
            ctx.accounts.collection_metadata.to_account_info(),       // Metadata Account
            ctx.accounts.token_metadata_program.to_account_info(), // Token Metadata Program Account
            ctx.accounts.token_program.to_account_info(),          // Token Program Account
            ctx.accounts.system_program.to_account_info(),         // System Program Account
            ctx.accounts.rent.to_account_info(),                   // Rent Account
        ];
        invoke_signed(
            &create_master_edition_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.collection_master_edition.key(),
                ctx.accounts.collection_mint.key(),
                ctx.accounts.user_account.key(),
                ctx.accounts.user_account.key(),
                ctx.accounts.collection_metadata.key(),
                ctx.accounts.owner.key(),
                Some(0),
            ),
            master_edition_infos.as_slice(),
            &[&[USER_SEED, ctx.accounts.owner.key().as_ref(), &[bump]]],
        )?;
    }

    {
        msg!("Set User Params");
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.owner.key();
        user_account.lamports_total = 0;
        user_account.collection_mint = ctx.accounts.collection_mint.key();
        user_account.collection_metadata = ctx.accounts.collection_metadata.key();
        user_account.collection_master_edition = ctx.accounts.collection_master_edition.key();
        user_account.bump = bump;
        user_account.creation_date = Clock::get()?.unix_timestamp as u64;

        user_account.eternalized = false;
    }

    Ok(())
}

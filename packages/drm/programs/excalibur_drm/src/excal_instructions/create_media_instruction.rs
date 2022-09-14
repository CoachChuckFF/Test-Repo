use crate::excal_accounts::media_account::*;
use crate::excal_accounts::media_hash_account::*;
use crate::excal_accounts::user_account::*;
use crate::excal_globals::constants::*;
use crate::excal_globals::errors::*;
use crate::excal_globals::parameters::*;
use crate::id;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::sysvar::rent;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{mint_to, MintTo};
use anchor_spl::token::{Mint, Token, TokenAccount};
use mpl_token_metadata::instruction::{
    create_metadata_accounts_v3, set_and_verify_sized_collection_item,
};
use mpl_token_metadata::pda::{find_master_edition_account, find_metadata_account};
use mpl_token_metadata::state::Creator;

#[derive(Accounts)]
#[instruction(distros: Vec<WorkerDistributionParam>)]
pub struct CreateMedia<'info> {
    // --------- Accounts ----------
    #[account(
        init,
        space = get_media_hash_size(),
        payer = owner,
    )]
    pub media_hash_account: Box<Account<'info, MediaHashAccount>>,

    #[account(
        init,
        space = get_media_size(get_real_distro_len(&user_account.key(), &distros)),
        payer = owner,
        seeds = [
            MEDIA_SEED,
            user_account.media_creation_count.to_be_bytes().as_ref(),
            owner.key().as_ref(),
        ],
        bump
    )]
    pub media_account: Box<Account<'info, MediaAccount>>,

    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = user_account,
        mint::freeze_authority = user_account
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = user_account,
    )]
    pub user_vault: Account<'info, TokenAccount>,

    #[account(mut, address=find_metadata_account(&mint.key()).0)]
    /// CHECK: TODO - look into making sure it's unitialized
    pub metadata: UncheckedAccount<'info>,

    #[account(mut, address=find_master_edition_account(&mint.key()).0)]
    /// CHECK: TODO - look into making sure it's unitialized
    pub master_edition: UncheckedAccount<'info>,

    // --------- Exsiting Accounts ----------
    #[account(mut, has_one=owner)]
    pub user_account: Box<Account<'info, UserAccount>>,

    #[account(address=user_account.collection_mint)]
    pub collection_mint: Box<Account<'info, Mint>>,
    /// CHECK: We check it by address here
    #[account(mut, address=user_account.collection_metadata)]
    pub collection_metadata: UncheckedAccount<'info>,
    #[account(address=user_account.collection_master_edition)]
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

#[derive(Clone, AnchorSerialize, AnchorDeserialize)]
pub struct WorkerDistributionParam {
    pub wallet: Pubkey,
    pub percentage: u64,
}

/// There will always be one distribution for the user account
pub fn get_real_distro_len(user_account: &Pubkey, distros: &Vec<WorkerDistributionParam>) -> usize {
    let mut real_distro_len = distros.len();

    if !distros.iter().any(|e| &e.wallet == user_account) {
        real_distro_len += 1;
    }

    return real_distro_len;
}

pub fn run_create_media(
    ctx: Context<CreateMedia>,
    distros: Vec<WorkerDistributionParam>,
    affiliate_split: u64,
    nft_params: NFTParams,
) -> Result<()> {
    {
        msg!("Check Params");
        if affiliate_split > MAX_PERCENT {
            return Err(error!(ExcalErrorCode::SplitOver100Percent));
        }
    }

    {
        msg!("Mint to Vault");
        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_vault.to_account_info(),
                    authority: ctx.accounts.user_account.to_account_info(),
                },
                &[&[
                    USER_SEED,
                    ctx.accounts.owner.key().as_ref(),
                    &[ctx.accounts.user_account.bump],
                ]],
            ),
            1,
        )?;
    }

    {
        msg!("Create Metadata");
        let account_info = vec![
            ctx.accounts.metadata.to_account_info(), // Metadata Account
            ctx.accounts.mint.to_account_info(),     // Mint Account
            ctx.accounts.user_account.to_account_info(), // Mint Authority Account
            ctx.accounts.owner.to_account_info(),    // Payer Account
            ctx.accounts.token_metadata_program.to_account_info(), // Token Metadata Program Account
            ctx.accounts.token_program.to_account_info(), // Token Program Account
            ctx.accounts.system_program.to_account_info(), // System Program Account
            ctx.accounts.rent.to_account_info(),     // Rent Account
        ];

        let creator = vec![
            Creator {
                address: ctx.accounts.user_account.key(), // User Account - Because its the signer
                verified: false,
                share: 0, // Distinction for user vs media
            },
            Creator {
                address: ctx.accounts.owner.key(), // Owner - For searching
                verified: false,
                share: 0,
            },
            Creator {
                address: self::id(), // Excalibur - For searching
                verified: false,
                share: 0,
            },
            Creator {
                address: ctx.accounts.media_account.key(), // Media Account - Because its the signer
                verified: false,
                share: 100, // Distinction for user vs media
            },
        ];

        invoke_signed(
            &create_metadata_accounts_v3(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.mint.key(),
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
                None,
            ),
            account_info.as_slice(),
            &[&[
                USER_SEED,
                ctx.accounts.owner.key().as_ref(),
                &[ctx.accounts.user_account.bump],
            ]],
        )?;
    }

    {
        msg!("Set and Verify Sized Collection");

        let set_and_veryify_infos = vec![
            ctx.accounts.metadata.to_account_info(), // Metadata account
            ctx.accounts.user_account.to_account_info(), // Collection Update authority
            ctx.accounts.owner.to_account_info(),    // payer
            ctx.accounts.user_account.to_account_info(), // Update Authority of Collection NFT and NFT
            ctx.accounts.collection_mint.to_account_info(), // Mint of the Collection
            ctx.accounts.collection_metadata.to_account_info(), // Metadata Account of the Collection
            ctx.accounts.collection_master_edition.to_account_info(), // MasterEdition2 Account of the Collection Token
        ];
        invoke_signed(
            &set_and_verify_sized_collection_item(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.user_account.key(),
                ctx.accounts.owner.key(),
                ctx.accounts.user_account.key(),
                ctx.accounts.collection_mint.key(),
                ctx.accounts.collection_metadata.key(),
                ctx.accounts.collection_master_edition.key(),
                None,
            ),
            set_and_veryify_infos.as_slice(),
            &[&[
                USER_SEED,
                ctx.accounts.owner.key().as_ref(),
                &[ctx.accounts.user_account.bump],
            ]],
        )?;
    }

    {
        msg!("Set Media Params");

        let media_account = &mut ctx.accounts.media_account;

        media_account.original_media = media_account.key();
        media_account.original_user = ctx.accounts.user_account.key();
        media_account.original_owner = ctx.accounts.owner.key();

        media_account.user_account = ctx.accounts.user_account.key();
        media_account.owner = ctx.accounts.owner.key();

        media_account.sft_mint = ctx.accounts.mint.key();
        media_account.media_hash = ctx.accounts.media_hash_account.key();
        // No SHDW Key Set here

        media_account.media_creation_index = ctx.accounts.user_account.media_creation_count;
        media_account.creation_date = Clock::get()?.unix_timestamp as u64;
        media_account.eternalized = false;
        media_account.affiliate_split = affiliate_split;

        media_account.crank_tally = 0;
        media_account.lamports_to_distribute = 0;
        media_account.lamports_total = 0;
        media_account.toll_to_distribute = 0;
        media_account.toll_total = 0;
        media_account.excal_to_distribute = 0;
        media_account.excal_total = 0;

        // No Futuer Use set here

        {
            msg!("Setting Distros ( {:?} ?+ 1 ) ", distros.len());
            let mut percent_tally = 0 as u64;
            for distro in distros {
                // Skip The user account, this is added at the end
                if distro.wallet != ctx.accounts.user_account.key() {
                    // No duplicates allowed
                    if media_account
                        .worker_distributions
                        .iter()
                        .any(|e| e.wallet == distro.wallet)
                    {
                        return Err(error!(ExcalErrorCode::DuplicateDistributions));
                    }

                    percent_tally += distro.percentage;
                    media_account.worker_distributions.push(WorkerDistribution {
                        wallet: distro.wallet,
                        percentage: distro.percentage,
                        lamports_earned: 0,
                        lamports_distributed: 0,
                    });
                }
            }

            // Over 100 percent is an error
            if percent_tally > MAX_PERCENT {
                return Err(error!(ExcalErrorCode::Over100Percent));
            }

            // Push the remaining percentage to the user - even if it's 0
            media_account.worker_distributions.push(WorkerDistribution {
                wallet: ctx.accounts.user_account.key(),
                percentage: MAX_PERCENT - percent_tally,
                lamports_earned: 0,
                lamports_distributed: 0,
            });
        }
    }

    {
        msg!("Set Media Hash Params");
        let media_hash_account = &mut ctx.accounts.media_hash_account;
        media_hash_account.user_account = ctx.accounts.user_account.key();
        media_hash_account.creation_date = Clock::get()?.unix_timestamp as u64;
    }

    {
        msg!("Increment User Creation Count");
        let user_account = &mut ctx.accounts.user_account;
        user_account.media_creation_count += 1;
    }

    Ok(())
}

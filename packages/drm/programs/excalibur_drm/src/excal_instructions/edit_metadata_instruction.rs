use crate::excal_accounts::user_account::*;
use crate::excal_globals::constants::*;
use crate::excal_globals::errors::*;
use crate::excal_globals::parameters::*;
use anchor_lang::prelude::*;

use anchor_lang::solana_program::program::invoke_signed;
use mpl_token_metadata::instruction::update_metadata_accounts_v2;
use mpl_token_metadata::state::{DataV2, Metadata, TokenMetadataAccount};

#[derive(Accounts)]
#[instruction(params: NFTParams)]
pub struct EditMetadata<'info> {
    // --------- Accounts ----------
    #[account(
        has_one = owner,
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        constraint = metadata.owner == &mpl_token_metadata::ID
    )]
    /// CHECK: We check it by address here
    pub metadata: AccountInfo<'info>,

    // --------- Programs ----------
    #[account(address = mpl_token_metadata::ID)]
    /// CHECK: We check it by address here
    pub token_metadata_program: UncheckedAccount<'info>,

    // --------- Signers ----------
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn run_edit_metadata(ctx: Context<EditMetadata>, params: NFTParams) -> Result<()> {
    let metadata_data =
        Metadata::from_account_info::<Metadata>(ctx.accounts.metadata.to_account_info().as_ref())?;

    {
        msg!("Check Metadata");

        if metadata_data.update_authority != ctx.accounts.user_account.key() {
            return Err(error!(ExcalErrorCode::AuthDoesNotMatchMetadata));
        }
    }

    {
        msg!("Edit Metadata");

        let update_metadata_infos = vec![
            ctx.accounts.metadata.to_account_info(), // Metadata Account - Writable
            ctx.accounts.user_account.to_account_info(), // User Account - Signer
        ];
        invoke_signed(
            &update_metadata_accounts_v2(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.user_account.key(),
                None,
                Some(DataV2 {
                    name: params.name,
                    symbol: params.symbol,
                    uri: params.uri,
                    seller_fee_basis_points: 0,
                    creators: None,
                    collection: metadata_data.collection,
                    uses: metadata_data.uses,
                }),
                None,
                None,
            ),
            update_metadata_infos.as_slice(),
            &[&[
                USER_SEED,
                ctx.accounts.owner.key().as_ref(),
                &[ctx.accounts.user_account.bump],
            ]],
        )?;
    }

    Ok(())
}

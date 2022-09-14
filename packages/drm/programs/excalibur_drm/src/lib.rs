use anchor_lang::prelude::*;
use anchor_lang::solana_program::log::sol_log_compute_units;
// Globals
mod excal_globals;
use excal_globals::parameters::*;

// Accounts
mod excal_accounts;

// Instructions
mod excal_instructions;
use excal_instructions::contribute_to_media_instruction::*;
use excal_instructions::contribute_to_user_instruction::*;
use excal_instructions::create_affiliate_instruction::*;
use excal_instructions::create_media_instruction::*;
use excal_instructions::create_user_instruction::*;
use excal_instructions::distribute_to_community_wallet_from_media_instruction::*;
use excal_instructions::distribute_to_community_wallet_from_user_instruction::*;
use excal_instructions::distribute_to_user_instruction::*;
use excal_instructions::distribute_to_workers_instruction::*;
use excal_instructions::edit_metadata_instruction::*;
use excal_instructions::print_sft_from_contributor_instruction::*;
use excal_instructions::print_sft_from_creator_instruction::*;

declare_id!("FWX7w9KrE8GBDzRfPSU91pGXmk32NF3iTL5jQqZVVtZL");

#[program]
pub mod excalibur_drm {

    use super::*;

    pub fn create_user(ctx: Context<CreateUser>, bump: u8, nft_params: NFTParams) -> Result<()> {
        run_create_user(ctx, bump, nft_params)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn create_media(
        ctx: Context<CreateMedia>,
        distros: Vec<WorkerDistributionParam>,
        affiliate_split: u64,
        nft_params: NFTParams,
    ) -> Result<()> {
        run_create_media(ctx, distros, affiliate_split, nft_params)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn create_affiliate(ctx: Context<CreateAffiliate>) -> Result<()> {
        run_create_affiliate(ctx)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn edit_metadata(ctx: Context<EditMetadata>, params: NFTParams) -> Result<()> {
        run_edit_metadata(ctx, params)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn print_sft_from_creator(ctx: Context<PrintSFTFromCreator>) -> Result<()> {
        run_print_sft_from_creator(ctx)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn print_sft_from_contributor(ctx: Context<PrintSFTFromContributor>) -> Result<()> {
        run_print_sft_from_contributor(ctx)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn contribute_to_media(
        ctx: Context<ContributeToMedia>,
        params: ContributeParams,
    ) -> Result<()> {
        run_contribute_to_media(ctx, params)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn contribute_to_user(
        ctx: Context<ContributeToUser>,
        params: ContributeParams,
    ) -> Result<()> {
        run_contribute_to_user(ctx, params)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn distribute_to_workers_crank(ctx: Context<DistributeToWorkersCrank>) -> Result<()> {
        run_distribute_to_workers_crank(ctx)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn distribute_to_community_from_media_crank(
        ctx: Context<DistributeToCommunityFromMediaCrank>,
    ) -> Result<()> {
        run_distribute_to_community_from_media_crank(ctx)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn distribute_to_community_from_user_crank(
        ctx: Context<DistributeToCommunityFromUserCrank>,
    ) -> Result<()> {
        run_distribute_to_community_from_user_crank(ctx)?;
        sol_log_compute_units();

        Ok(())
    }

    pub fn distribute_to_user_crank(ctx: Context<DistributeToUserCrank>) -> Result<()> {
        run_distribute_to_user_crank(ctx)?;
        sol_log_compute_units();

        Ok(())
    }
}

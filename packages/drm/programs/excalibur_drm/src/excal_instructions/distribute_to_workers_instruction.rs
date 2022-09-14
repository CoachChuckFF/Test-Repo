use crate::excal_accounts::media_account::*;
use crate::excal_globals::constants::*;
use crate::excal_globals::errors::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DistributeToWorkersCrank<'info> {
    // --------- Old Accounts ----------
    #[account(mut)]
    pub media_account: Box<Account<'info, MediaAccount>>,

    #[account(mut)]
    /// CHECK: nothing will happen if it does not match
    pub recipient: AccountInfo<'info>,
}

pub fn run_distribute_to_workers_crank(ctx: Context<DistributeToWorkersCrank>) -> Result<()> {
    {
        msg!("Internal Distribute");
        let media = &mut ctx.accounts.media_account;
        let gross_media_lamports = media.to_account_info().lamports();
        let media_rent =
            Rent::get()?.minimum_balance(get_media_size(media.worker_distributions.len()));

        if gross_media_lamports
            > media_rent + media.lamports_to_distribute + media.toll_to_distribute + MAX_PERCENT
        {
            let distro = gross_media_lamports
                - media.lamports_to_distribute
                - media.toll_to_distribute
                - media_rent;
            let mut distro_tally = 0 as u64;

            for i in 0..media.worker_distributions.len() {
                let piece = distro / MAX_PERCENT * media.worker_distributions[i].percentage;

                media.worker_distributions[i].lamports_earned += piece;
                distro_tally += piece;
            }

            media.lamports_to_distribute += distro_tally;
            media.lamports_total += distro_tally;
        } else {
            msg!("Nothing to Distribute");
        }
    }

    {
        msg!("Distribute Lamports");

        let media = &mut ctx.accounts.media_account;
        let recipient = &mut ctx.accounts.recipient;

        for i in 0..media.worker_distributions.len() {
            if &media.worker_distributions[i].wallet == recipient.key {
                if media.worker_distributions[i].lamports_earned
                    > media.worker_distributions[i].lamports_distributed
                {
                    let amount = media.worker_distributions[i].lamports_earned
                        - media.worker_distributions[i].lamports_distributed;

                    // Will fail if recipient does not have enough lamports - ( needs to meet minimum rent )
                    **media.to_account_info().try_borrow_mut_lamports()? -= amount;
                    **recipient.try_borrow_mut_lamports()? += amount;

                    media.worker_distributions[i].lamports_distributed += amount;
                    media.lamports_to_distribute -= amount;
                    media.crank_tally += 1;
                }

                break;
            }
        }
    }

    Ok(())
}

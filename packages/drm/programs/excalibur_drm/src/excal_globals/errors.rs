use anchor_lang::prelude::*;

#[error_code]
pub enum ExcalErrorCode {
    #[msg("Auth does not match Metadata")]
    AuthDoesNotMatchMetadata,
    #[msg("Not Correct Edition")]
    NotCorrectEdition,
    #[msg("No one has contributed yet")]
    NoContributions,
    #[msg("Duplicate Distributions")]
    DuplicateDistributions,
    #[msg("Percentages do not add up to 100")]
    Over100Percent,
    #[msg("Affiliate split is over 100 percent")]
    SplitOver100Percent,
    #[msg("For some reason the rent cost is higher than the current balance")]
    MoreRentThanBalance,
    #[msg("Cannot contribute to your own profile")]
    CannotContributeToYourOwnProfile,
    #[msg("Cannot contribute to your own work")]
    CannotContributeToYourOwnWork,
    #[msg("Cannot contribute to a derivative of your own work")]
    CannotContributeToDerivativeOfYourOwnWork,
}

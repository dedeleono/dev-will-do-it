//! Program errors
use anchor_lang::prelude::*;
// All Error codes
#[error_code]
pub enum DwdiErrors {
    /// Error for unauthorized access
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid fee receiver")]
    InvalidFeeReceiver,
    #[msg("Already setup")]
    SetupComplete,

    // Transfer Errors
    #[msg("Fee transfer failed")]
    FeeTransferFailed,
    #[msg("Invalid referral account")]
    InvalidReferralAccount,
    #[msg("Token Mint failed")]
    TokenMintFailed,
    #[msg("Liquidity supply exceeded")]
    LiquiditySupplyExceeded,
    #[msg("Max TX amount exceeded")]
    MaxTxAmountExceeded,
    // Specific Transfer Errors
    #[msg("Referral fee transfer failed")]
    ReferralFeeTransferFailed,
    #[msg("Reserve Token transfer failed")]
    ReserveTokenTransferFailed,
    #[msg("Reserve Token Protocol fee transfer failed")]
    ReserveTokenProtocolFeeTransferFailed,
    #[msg("Curve Token transfer failed")]
    CurveTokenTransferFailed,
    #[msg("Jeet tears failed to Transfer")]
    JeetTearsFailedToTransfer,
    #[msg("Referral is signer")]
    ReferralIsSigner,
    // Curve Errors
    #[msg("Invalid Vesting Params")]
    InvalidVestingParams,

    // Placeholder
    #[msg("Placeholder mint error")]
    PlaceholderMintError,
    #[msg("Placeholder burn error")]
    PlaceholderBurnError,

    // Curve Status
    #[msg("Curve not started")]
    CurveNotStarted,
    #[msg("Curve ended")]
    CurveEnded,
    #[msg("Curve already enabled")]
    CurveAlreadyEnabled,

    // Buy/Sell Calculation Errors
    #[msg("Insufficient supply of tokens.")]
    InsufficientSupply,
    #[msg("Insufficient reserve of SOL.")]
    InsufficientReserve,
    #[msg("Math overflow error.")]
    MathOverflow,
    #[msg("Max number of tokens per transaction reached")]
    MaxTxTokens,
    #[msg("Invalid reserve token")]
    InvalidReserveToken,
}

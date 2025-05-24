use anchor_lang::prelude::*;
// Bonding curve account must be created by using the seeds:
// - constant string = "curve"
// - token_s => meme coin
// - token_r => reserve coin
#[account]
pub struct BondingCurve {
    // Owner of the curve
    pub dev: Pubkey,
    // Token that is used to buy the curve
    pub reserve_token: Pubkey,
    // Curve exponential parameters
    pub a: f64,
    pub b: f64,
    // Curve Tokens Sold
    pub tokens_sold: u64,
    // Liquidity goal of the curve (this number is in SOL)
    pub liquidity_supply: u64,
    // Maximum number of tokens that can be traded in a single transaction
    pub max_tx_tokens: u64,
    // Only sell fee
    pub sell_fee: u64,
    // Platform fee (this is fixed fee that goes to the platform)
    pub platform_fee: u64,
    // Referral basis points
    // BUYS only
    // only if referral exists and is > 0
    pub referral_basis: u64,
    // Vesting basis points
    // Percentage of the amount per interval
    pub vesting_basis: u64,
    // interval in seconds
    pub vesting_interval: i64,
    // Time when first claim is available
    pub vesting_start: i64,
    // Time when the curve starts
    pub curve_start: i64,
    // Status of the curve
    pub status: CurveStatus,
}
#[account]
pub struct CurveEnd {
    pub end_time: i64,
    pub reserve_collected: u64,
    pub total_jeet_tears: u64,
    pub tokens_sold: u64,
}
#[account]
pub struct GlobalInfo {
    pub total_raises: u64,
    pub processing_fee: u64,
    pub platform_fee_basis: u64,
    pub owner: Pubkey,
    pub fee_receiver: Pubkey,
}

#[account]
pub struct VestedAmounts {
    // Total amount of tokens to be claimed
    pub total_amount: u64,
    // Amount claimed by user
    pub claimed_amount: u64,
    // Time when vesting starts
    pub vesting_start: i64,
    // Time of last claim
    pub last_claim: i64,
    // Amount of time between claims
    pub vesting_interval: i64,
    // e.g. 10% per claim (total 10 claims, inital one is after raise_ends)
    pub percent_per_claim: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum CurveStatus {
    Init,
    Active,
    Success,
    Ended,
    Setup,
}

#[account]
pub struct TestCurve {
    pub tokens_sold: u64,
    pub reserve_collected: u64,
    pub a: f64,
    pub b: f64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct MinimalCurveParms {
    // b is a fixed constant
    pub a: f64,
    pub liquidity_supply: u64,
    pub max_tx_tokens: u64,
    pub sell_fee: u64,
    pub referral_basis: u64,
    pub vesting_basis: u64,
    pub vesting_interval: i64,
    pub vesting_start: i64,
}

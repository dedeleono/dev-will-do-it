#![allow(clippy::result_large_err)]
pub mod data_accounts;
pub mod errors;
pub mod events;

use anchor_lang::{
    prelude::*,
    solana_program::{clock::Clock, program::invoke_signed, system_instruction},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, mint_to, transfer, Burn, Mint, MintTo, Token, TokenAccount, Transfer},
};
use data_accounts::*;
use errors::*;
use events::*;

declare_id!("HcuMHMV2iySZmGGGNvtZYaDGF1W2hJPuDzkWKajMrhJx");

pub mod constants {
    pub const CURVE: &[u8] = b"curve";
    pub const GLOBAL: &[u8] = b"global";
    pub const CURVE_HOLDER: &[u8] = b"curve_holder";
    pub const RESERVE_HOLDER: &[u8] = b"reserve_holder";
    pub const PLACEHOLDER: &[u8] = b"placeholder";
    pub const JEET_TEARS: &[u8] = b"jeet_tears";
    pub const PERCENT_BASIS: u64 = 100_00; // 100%
    pub const BASE_TOKEN_SUPPLY: u64 = 1_000_000_000_000_000_000; // 1 billion tokens at 9 decimals
    pub const ONE_TOKEN: u64 = 1_000_000_000; // 1 token
    pub const ONE_F: f64 = 1_000_000_000_f64;
    pub const B: f64 = 0.000000007;
}

#[program]
pub mod dwdi_programs {
    use super::*;

    //-----------------------------------------------------------------------------------------------
    // Initialize
    //-----------------------------------------------------------------------------------------------

    /*
     *  Initialize the program
     *  No other safeguards are necessary since Initialize will try to create the global Info Account
     *  If it already exists, it will just return an error
     */
    pub fn initialize(ctx: Context<Initialize>, receiver: Pubkey, fee: u64) -> Result<()> {
        let global_info = &mut ctx.accounts.global_info;
        global_info.owner = ctx.accounts.signer.key();
        global_info.fee_receiver = receiver;
        global_info.processing_fee = fee;
        global_info.platform_fee_basis = 10;
        global_info.total_raises = 0;
        Ok(())
    }
    //-----------------------------------------------------------------------------------------------
    // Owner Functions
    //-----------------------------------------------------------------------------------------------
    /*
     *  Update the global fee
     *  Only the owner of the global info account can update the fee
     */
    pub fn update_global_fee(ctx: Context<UpdateGlobalFee>, fee: u64) -> Result<()> {
        let global_info = &mut ctx.accounts.global_info;
        if global_info.owner != ctx.accounts.signer.key() {
            return err!(DwdiErrors::Unauthorized);
        }
        global_info.processing_fee = fee;
        Ok(())
    }
    //-----------------------------------------------------------------------------------------------
    // Create Curve
    //-----------------------------------------------------------------------------------------------
    /*
     *  Create a curve
     *  Anyone can create a curve with a token, token must be unique, no other raises can be created with the same token after the curve is created
     *  The curve creates a placeholder token that will be used to track the amount of tokens sold, these tokens are minted and burned as they serve no purpose
     *  other than keep track. These tokens are not tradable, can only be used to buy/sell on the bonding curve and after the curve ends, will be redeemed for the custom token
     */
    pub fn create_curve(ctx: Context<CreateCurve>, params: MinimalCurveParms) -> Result<()> {
        let curve_data = &mut ctx.accounts.curve_data;
        curve_data.dev = ctx.accounts.signer.key();
        if curve_data.status == CurveStatus::Setup {
            return err!(DwdiErrors::SetupComplete);
        }
        curve_data.reserve_token = ctx.accounts.reserve_token.key();
        curve_data.max_tx_tokens = params.max_tx_tokens;
        curve_data.referral_basis = params.referral_basis;
        curve_data.sell_fee = params.sell_fee;
        curve_data.a = params.a;
        curve_data.b = constants::B;
        curve_data.tokens_sold = 0;
        curve_data.liquidity_supply = params.liquidity_supply;
        curve_data.status = CurveStatus::Init;
        curve_data.platform_fee = ctx.accounts.global_info.platform_fee_basis;
        if params.vesting_basis == 0 && params.vesting_interval > 0 {
            return err!(DwdiErrors::InvalidVestingParams);
        }
        curve_data.vesting_basis = params.vesting_basis;
        curve_data.vesting_interval = params.vesting_interval;
        curve_data.vesting_start = params.vesting_start;

        // Transfer Fees to Fee Receiver
        if ctx.accounts.fee_receiver.key() != ctx.accounts.global_info.fee_receiver {
            return err!(DwdiErrors::InvalidFeeReceiver);
        }
        msg!("Fee Receiver checked {:?}", ctx.accounts.fee_receiver.key());
        let transfer_instruction = system_instruction::transfer(
            ctx.accounts.signer.key,
            ctx.accounts.fee_receiver.key,
            ctx.accounts.global_info.processing_fee,
        );
        msg!("Transfer Instruction created");
        match invoke_signed(
            &transfer_instruction,
            &[
                ctx.accounts.signer.to_account_info(),
                ctx.accounts.fee_receiver.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[],
        ) {
            Ok(_) => (),
            Err(_) => return err!(DwdiErrors::FeeTransferFailed),
        }
        msg!("Fee Transfer Success");
        let tokens_for_raise = ctx.accounts.curve_token.supply;
        // Transfer curve tokens to curve_holder
        match transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.signer_curve_holder.to_account_info(),
                    to: ctx.accounts.curve_holder.to_account_info(),
                    authority: ctx.accounts.signer.to_account_info(),
                },
            ),
            tokens_for_raise,
        ) {
            Ok(_) => (),
            Err(_) => return err!(DwdiErrors::CurveTokenTransferFailed),
        }
        msg!("Curve Token Transfer Success");
        emit!(CreateCurveEvent {
            curve_token: ctx.accounts.curve_token.key(),
            reserve_token: ctx.accounts.reserve_token.key(),
            curve_address: ctx.accounts.curve_data.key(),
            owner: ctx.accounts.signer.key(),
        });
        ctx.accounts.global_info.total_raises += 1;
        Ok(())
    }

    pub fn create_curve_accounts(
        _ctx: Context<RelevantCurveAccounts>,
        _curve_token: Pubkey,
    ) -> Result<()> {
        Ok(())
    }
    //-----------------------------------------------------------------------------------------------
    // Curve Actions
    //-----------------------------------------------------------------------------------------------
    pub fn enable_curve_for_all(ctx: Context<EnableCurve>, _curve_token: Pubkey) -> Result<()> {
        match ctx.accounts.curve_data.status {
            CurveStatus::Init => {
                if ctx.accounts.signer.key() != ctx.accounts.global_info.owner
                    || ctx.accounts.signer.key() != ctx.accounts.curve_data.dev
                {
                    return err!(DwdiErrors::Unauthorized);
                }
                ctx.accounts.curve_data.status = CurveStatus::Active;
                ctx.accounts.curve_data.curve_start = Clock::get()?.unix_timestamp;
            }
            _ => return err!(DwdiErrors::CurveAlreadyEnabled),
        }
        Ok(())
    }

    pub fn end_curve(_ctx: Context<EndCurve>) -> Result<()> {
        Ok(())
    }

    pub fn claim_tokens(_ctx: Context<ClaimTokens>) -> Result<()> {
        Ok(())
    }

    pub fn buy_or_sell(ctx: Context<BuyOrSell>, amount: u64, buy_or_sell: bool) -> Result<()> {
        let curve_data = &mut ctx.accounts.curve_data;
        // Check reserve token
        if ctx.accounts.reserve_token.key() != curve_data.reserve_token {
            return err!(DwdiErrors::InvalidReserveToken);
        }
        // check curve status - Err on Ended or Success
        match curve_data.status {
            CurveStatus::Init => {
                if ctx.accounts.signer.key() != curve_data.dev {
                    return err!(DwdiErrors::CurveNotStarted);
                }
                curve_data.curve_start = Clock::get()?.unix_timestamp;
                curve_data.status = CurveStatus::Active;
            }
            CurveStatus::Ended | CurveStatus::Success => return err!(DwdiErrors::CurveEnded),
            _ => (),
        }

        match buy_or_sell {
            true => {
                // Buy Tokens
                // Calculate Fees
                let (transfer_amount, referral_fee, platform_fee) = calc_fees(
                    ctx.accounts.referral_reserve_account.as_ref(),
                    ctx.accounts.signer.key(),
                    ctx.accounts.global_info.platform_fee_basis,
                    curve_data.referral_basis,
                    amount,
                    true,
                )?;
                // Check SOL amount added to make sure if it does not exceed liquidity_supply
                let final_reserve = ctx.accounts.reserve_holder.amount + transfer_amount;
                if final_reserve > curve_data.liquidity_supply + constants::ONE_TOKEN {
                    return err!(DwdiErrors::LiquiditySupplyExceeded);
                }
                // 2 SOL buffer for liquidity
                if final_reserve <= curve_data.liquidity_supply + constants::ONE_TOKEN
                    && final_reserve >= curve_data.liquidity_supply - constants::ONE_TOKEN
                {
                    curve_data.status = CurveStatus::Success;
                }
                // Calc Tokens OUT
                let tokens_out =
                    calc_tokens_out(curve_data.a, curve_data.b, curve_data.tokens_sold, amount)?;
                // Check Max TX
                if curve_data.max_tx_tokens > 0 && tokens_out > curve_data.max_tx_tokens {
                    return err!(DwdiErrors::MaxTxAmountExceeded);
                }
                curve_data.tokens_sold += tokens_out;
                // Process Referral Fee
                if referral_fee > 0 {
                    msg!("Processing Referral Fee");
                    process_referral_fee(
                        ctx.accounts.token_program.to_account_info(),
                        ctx.accounts.signer.to_account_info(),
                        ctx.accounts.user_reserve_holder.to_account_info(),
                        ctx.accounts
                            .referral_reserve_account
                            .as_ref()
                            .unwrap()
                            .to_account_info(),
                        referral_fee,
                    )?;
                }
                // Process Platform Fee
                if platform_fee > 0 {
                    // Check platform fee receiver is OK
                    if ctx.accounts.protocol_fee_receiver.owner != ctx.accounts.global_info.owner {
                        return err!(DwdiErrors::InvalidFeeReceiver);
                    }
                    msg!("Processing Platform Fee");
                    process_platform_fee(
                        ctx.accounts.token_program.to_account_info(),
                        ctx.accounts.signer.to_account_info(),
                        ctx.accounts.user_reserve_holder.to_account_info(),
                        ctx.accounts.protocol_fee_receiver.to_account_info(),
                        platform_fee,
                    )?;
                }
                // Transfer wSOL IN
                process_tokens_in(
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.signer.to_account_info(),
                    ctx.accounts.user_reserve_holder.to_account_info(),
                    ctx.accounts.reserve_holder.to_account_info(),
                    transfer_amount,
                )?;
                // Check if VESTING Exists
                match curve_data.vesting_basis {
                    0 => {
                        // No Vesting, Transfer Tokens OUT
                        process_tokens_out(
                            &[
                                constants::CURVE_HOLDER,
                                &ctx.accounts.curve_token.key().to_bytes(),
                                &[ctx.bumps.curve_holder],
                            ],
                            ctx.accounts.token_program.to_account_info(),
                            ctx.accounts.curve_holder.to_account_info(),
                            ctx.accounts.user_curve_holder.to_account_info(),
                            tokens_out,
                        )?;
                    }
                    _ => {
                        // Vesting Exists, Mint Placeholder Tokens OUT
                        process_mint_out(
                            &[
                                constants::PLACEHOLDER,
                                &ctx.accounts.curve_token.key().to_bytes(),
                                &[ctx.bumps.placeholder_mint],
                            ],
                            ctx.accounts.token_program.to_account_info(),
                            ctx.accounts.placeholder_mint.to_account_info(),
                            ctx.accounts.user_placeholder_curve.to_account_info(),
                            tokens_out,
                        )?;
                    }
                }
                msg!(
                    "Bought Tokens:{:?} SOL:{:?} tokens_sold:{:?}",
                    tokens_out,
                    amount,
                    curve_data.tokens_sold
                );
                emit!(BuyEvent {
                    curve_token: ctx.accounts.curve_token.key(),
                    amount_bought: tokens_out,
                    amount_paid: amount,
                    buyer: ctx.accounts.signer.key(),
                });
            }
            false => {
                // Sell Tokens
                let mut reserve_out =
                    calc_reserve_out(curve_data.a, curve_data.b, amount, curve_data.tokens_sold)?;
                curve_data.tokens_sold -= amount;
                if reserve_out > ctx.accounts.reserve_holder.amount {
                    reserve_out = ctx.accounts.reserve_holder.amount;
                }
                // Calculate Fees
                let (mut transfer_amount, _, platform_fee) = calc_fees(
                    ctx.accounts.referral_reserve_account.as_ref(),
                    ctx.accounts.signer.key(),
                    ctx.accounts.global_info.platform_fee_basis,
                    curve_data.referral_basis,
                    reserve_out,
                    false,
                )?;
                // Transfer Tokens IN
                match curve_data.vesting_basis {
                    0 => {
                        // No Vesting, Transfer Tokens IN
                        process_tokens_in(
                            ctx.accounts.token_program.to_account_info(),
                            ctx.accounts.signer.to_account_info(),
                            ctx.accounts.user_curve_holder.to_account_info(),
                            ctx.accounts.curve_holder.to_account_info(),
                            amount,
                        )?;
                    }
                    _ => {
                        // Vesting Exists, Mint Placeholder Tokens OUT
                        process_burn_tokens(
                            ctx.accounts.token_program.to_account_info(),
                            ctx.accounts.placeholder_mint.to_account_info(),
                            ctx.accounts.user_placeholder_curve.to_account_info(),
                            ctx.accounts.signer.to_account_info(),
                            amount,
                        )?;
                    }
                }
                // process jeet tears
                if curve_data.sell_fee > 0 {
                    let jeet_tears =
                        transfer_amount * curve_data.sell_fee / constants::PERCENT_BASIS;
                    transfer_amount -= jeet_tears;
                    // Process Jeet Tears
                    process_tokens_out(
                        &[
                            constants::RESERVE_HOLDER,
                            &ctx.accounts.curve_token.key().to_bytes(),
                            &[ctx.bumps.reserve_holder],
                        ],
                        ctx.accounts.token_program.to_account_info(),
                        ctx.accounts.reserve_holder.to_account_info(),
                        ctx.accounts.jeet_tears.to_account_info(),
                        jeet_tears,
                    )?;
                }
                // Process Platform Fee
                process_tokens_out(
                    &[
                        constants::RESERVE_HOLDER,
                        &ctx.accounts.curve_token.key().to_bytes(),
                        &[ctx.bumps.reserve_holder],
                    ],
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.reserve_holder.to_account_info(),
                    ctx.accounts.protocol_fee_receiver.to_account_info(),
                    platform_fee,
                )?;
                // Transfer wSOL OUT
                process_tokens_out(
                    &[
                        constants::RESERVE_HOLDER,
                        &ctx.accounts.curve_token.key().to_bytes(),
                        &[ctx.bumps.reserve_holder],
                    ],
                    ctx.accounts.token_program.to_account_info(),
                    ctx.accounts.reserve_holder.to_account_info(),
                    ctx.accounts.user_reserve_holder.to_account_info(),
                    transfer_amount,
                )?;
                msg!(
                    "Tokens:{:?} SOL:{:?} tokens_sold:{:?}",
                    amount,
                    reserve_out,
                    curve_data.tokens_sold,
                );
                emit!(SellEvent {
                    curve_token: ctx.accounts.curve_token.key(),
                    amount_sold: amount,
                    amount_received: transfer_amount,
                    seller: ctx.accounts.signer.key(),
                });
            }
        }
        Ok(())
    }

    pub fn create_test_curve(
        ctx: Context<TestCurveAccounts>,
        _test_id: u64,
        a: f64,
        b: f64,
    ) -> Result<()> {
        let test_curve = &mut ctx.accounts.test_curve;
        test_curve.a = a;
        test_curve.b = b;
        test_curve.tokens_sold = 0;
        test_curve.reserve_collected = 0;
        Ok(())
    }
    pub fn test_curve(
        ctx: Context<TestCurveAccounts>,
        _test_id: u64,
        amount: u64,
        buy_sell: bool,
    ) -> Result<()> {
        let test_curve = &mut ctx.accounts.test_curve;
        match buy_sell {
            true => {
                // Buy Tokens
                let tokens_out =
                    calc_tokens_out(test_curve.a, test_curve.b, test_curve.tokens_sold, amount)?;
                test_curve.tokens_sold += tokens_out;
                test_curve.reserve_collected += amount;
            }
            false => {
                // Sell Tokens
                let reserve_out =
                    calc_reserve_out(test_curve.a, test_curve.b, amount, test_curve.tokens_sold)?;
                msg!("reserve_collected: {}", test_curve.reserve_collected);
                msg!("reserve_out: {}", reserve_out);
                test_curve.tokens_sold -= amount;
                test_curve.reserve_collected -= reserve_out;
            }
        }
        Ok(())
    }
}
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
// Helper Functions
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
// Calculate Fees & Process Fees
//-----------------------------------------------------------------------------------------------
fn calc_fees<'info>(
    referral_account: Option<&Box<Account<'info, TokenAccount>>>,
    signer: Pubkey,
    platform_basis: u64,
    referral_basis: u64,
    amount: u64,
    is_buy: bool,
) -> Result<(u64, u64, u64)> {
    let referral_fee: u64;
    let platform_fee;
    if is_buy {
        referral_fee = match referral_account {
            Some(referral_account) => {
                // Get referral fee
                if referral_account.owner == signer {
                    return err!(DwdiErrors::ReferralIsSigner);
                }
                amount * referral_basis / constants::PERCENT_BASIS
            }
            None => 0,
        };
    } else {
        referral_fee = 0;
    }
    platform_fee = amount * platform_basis / constants::PERCENT_BASIS;
    let transfer_amount = amount - referral_fee - platform_fee;
    Ok((transfer_amount, referral_fee, platform_fee))
}

fn process_referral_fee<'info>(
    token_program: AccountInfo<'info>,
    signer: AccountInfo<'info>,
    user_reserve_holder: AccountInfo<'info>,
    referral_reserve_account: AccountInfo<'info>,
    referral_fee: u64,
) -> Result<()> {
    match transfer(
        CpiContext::new(
            token_program.to_account_info(),
            Transfer {
                from: user_reserve_holder.to_account_info(),
                to: referral_reserve_account.to_account_info(),
                authority: signer.to_account_info(),
            },
        ),
        referral_fee,
    ) {
        Ok(_) => Ok(()),
        Err(_) => return err!(DwdiErrors::ReferralFeeTransferFailed),
    }
}

fn process_platform_fee<'info>(
    token_program: AccountInfo<'info>,
    signer: AccountInfo<'info>,
    user_reserve_holder: AccountInfo<'info>,
    protocol_fee_receiver: AccountInfo<'info>,
    platform_fee: u64,
) -> Result<()> {
    match transfer(
        CpiContext::new(
            token_program.to_account_info(),
            Transfer {
                from: user_reserve_holder.to_account_info(),
                to: protocol_fee_receiver.to_account_info(),
                authority: signer.to_account_info(),
            },
        ),
        platform_fee,
    ) {
        Ok(_) => Ok(()),
        Err(_) => return err!(DwdiErrors::ReserveTokenProtocolFeeTransferFailed),
    }
}
//-----------------------------------------------------------------------------------------------
// Transfer wSOL IN
//-----------------------------------------------------------------------------------------------
fn process_tokens_in<'info>(
    token_program: AccountInfo<'info>,
    signer: AccountInfo<'info>,
    user_reserve_holder: AccountInfo<'info>,
    platform_reserve_holder: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    match transfer(
        CpiContext::new(
            token_program.to_account_info(),
            Transfer {
                from: user_reserve_holder.to_account_info(),
                to: platform_reserve_holder.to_account_info(),
                authority: signer.to_account_info(),
            },
        ),
        amount,
    ) {
        Ok(_) => Ok(()),
        Err(_) => return err!(DwdiErrors::ReserveTokenTransferFailed),
    }
}
//-----------------------------------------------------------------------------------------------
// Transfer Tokens OUT
//-----------------------------------------------------------------------------------------------
fn process_tokens_out<'info>(
    seeds: &[&[u8]],
    token_program: AccountInfo<'info>,
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let signer = [&seeds[..]];
    let authority = from.clone();
    match transfer(
        CpiContext::new_with_signer(
            token_program,
            Transfer {
                from: from,
                to: to,
                authority: authority,
            },
            &signer,
        ),
        amount,
    ) {
        Ok(_) => Ok(()),
        Err(_) => return err!(DwdiErrors::CurveTokenTransferFailed),
    }
}
//-----------------------------------------------------------------------------------------------
// Burn Tokens IN
//-----------------------------------------------------------------------------------------------
fn process_burn_tokens<'info>(
    token_program: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    from: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    match burn(
        CpiContext::new(
            token_program.to_account_info(),
            Burn {
                mint: mint,
                from: from,
                authority: authority,
            },
        ),
        amount,
    ) {
        Ok(_) => Ok(()),
        Err(_) => return err!(DwdiErrors::PlaceholderBurnError),
    }
}
//-----------------------------------------------------------------------------------------------
// Mint Tokens OUT
//-----------------------------------------------------------------------------------------------
fn process_mint_out<'info>(
    seeds: &[&[u8]],
    token_program: AccountInfo<'info>,
    mint: AccountInfo<'info>,
    to: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let signer = [&seeds[..]];
    let authority = mint.clone();

    match mint_to(
        CpiContext::new_with_signer(
            token_program,
            MintTo {
                mint: mint,
                to: to,
                authority: authority,
            },
            &signer,
        ),
        amount,
    ) {
        Ok(_) => Ok(()),
        Err(_) => return err!(DwdiErrors::PlaceholderMintError),
    }
}
//-----------------------------------------------------------------------------------------------
// Calculate Tokens OUT & Reserve OUT
//-----------------------------------------------------------------------------------------------
fn calc_tokens_out(a: f64, b: f64, tokens_sold: u64, reserve_in: u64) -> Result<u64> {
    let res = b * (tokens_sold as f64) / constants::ONE_F;
    let init_reserve_term = res.exp();
    let ln_term = ((reserve_in as f64) * b) / (a * constants::ONE_F) + init_reserve_term;
    let tokens_out = (ln_term.ln() * constants::ONE_F / b) as u64 - tokens_sold;
    Ok(tokens_out)
}

fn calc_reserve_out(a: f64, b: f64, tokens_in: u64, tokens_sold: u64) -> Result<u64> {
    let f_t1 = (b * (tokens_sold as f64) / constants::ONE_F).exp();
    let f_t0 = (b * ((tokens_sold - tokens_in) as f64) / constants::ONE_F).exp();
    msg!("f_t1: {}", f_t1);
    msg!("f_t0: {}", f_t0);
    let reserve_out = (f_t1 - f_t0) * a * constants::ONE_F / b;
    Ok(reserve_out as u64)
}
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
// Context Accounts
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init,
        payer = signer,
        seeds = [constants::GLOBAL],
        bump,
    space = 8 + std::mem::size_of::<GlobalInfo>()
    )]
    pub global_info: Account<'info, GlobalInfo>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCurve<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut,
        seeds = [constants::GLOBAL],
        bump,
    )]
    pub global_info: Box<Account<'info, GlobalInfo>>,

    #[account(init,
        payer = signer,
        seeds = [constants::CURVE, curve_token.key().as_ref()],
        bump,
        space = 8 + std::mem::size_of::<BondingCurve>()
    )]
    pub curve_data: Box<Account<'info, BondingCurve>>,
    /// CHECK: This wallet will simply receive lamports
    #[account(mut)]
    pub fee_receiver: SystemAccount<'info>,

    #[account(init,
        payer = signer,
        token::mint = curve_token,
        token::authority = curve_holder,
        seeds = [constants::CURVE_HOLDER, curve_token.key().as_ref()],
        bump,
    )]
    pub curve_holder: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub signer_curve_holder: Box<Account<'info, TokenAccount>>,
    pub curve_token: Box<Account<'info, Mint>>,
    pub reserve_token: Box<Account<'info, Mint>>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(curve_token: Pubkey)]
pub struct RelevantCurveAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init,
        payer = signer,
        mint::decimals = 9,
        mint::authority = placeholder_mint,
        seeds = [constants::PLACEHOLDER, curve_token.key().as_ref()],
        bump,
    )]
    pub placeholder_mint: Box<Account<'info, Mint>>,
    #[account(init,
        payer = signer,
        token::mint = reserve_token,
        token::authority = jeet_tears,
        seeds = [constants::JEET_TEARS, curve_token.key().as_ref()],
        bump,
    )]
    pub jeet_tears: Box<Account<'info, TokenAccount>>,
    pub reserve_token: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(curve_token: Pubkey)]
pub struct EnableCurve<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        seeds = [constants::GLOBAL],
        bump,
    )]
    pub global_info: Box<Account<'info, GlobalInfo>>,
    #[account(mut,
        seeds = [constants::CURVE, curve_token.key().as_ref()],
        bump,
    )]
    pub curve_data: Box<Account<'info, BondingCurve>>,
    #[account(mut,
        seeds = [constants::PLACEHOLDER, curve_token.key().as_ref()],
        bump,
    )]
    pub placeholder_mint: Box<Account<'info, Mint>>,
    #[account(mut,
        seeds = [constants::JEET_TEARS, curve_token.key().as_ref()],
        bump,
    )]
    pub jeet_tears: Box<Account<'info, TokenAccount>>,
    pub reserve_token: Box<Account<'info, Mint>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyOrSell<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut,
        seeds = [constants::GLOBAL],
        bump,
    )]
    pub global_info: Box<Account<'info, GlobalInfo>>,
    #[account(mut,
        seeds = [constants::CURVE, curve_token.key().as_ref()],
        bump
    )]
    pub curve_data: Box<Account<'info, BondingCurve>>,
    #[account(init_if_needed,
        seeds = [constants::RESERVE_HOLDER, curve_token.key().as_ref()],
        bump,
        payer = signer,
        token::mint = reserve_token,
        token::authority = reserve_holder,
    )]
    pub reserve_holder: Box<Account<'info, TokenAccount>>,
    #[account(mut,
        seeds = [constants::CURVE_HOLDER, curve_token.key().as_ref()],
        bump,
    )]
    pub curve_holder: Box<Account<'info, TokenAccount>>,
    #[account(mut,
        seeds = [constants::JEET_TEARS, curve_token.key().as_ref()],
        bump,
    )]
    pub jeet_tears: Box<Account<'info, TokenAccount>>,
    // @note make sure protocol owner creates this account before.
    #[account(mut, token::mint = reserve_token, token::authority = global_info.owner)]
    pub protocol_fee_receiver: Box<Account<'info, TokenAccount>>,
    // @note Make sure to create these accounts on a separate previous instruction
    #[account(
        mut,
        associated_token::mint = placeholder_mint,
        associated_token::authority = signer,
    )]
    pub user_placeholder_curve: Box<Account<'info, TokenAccount>>,
    #[account(mut,
        associated_token::mint = reserve_token,
        associated_token::authority = signer,
    )]
    pub user_reserve_holder: Box<Account<'info, TokenAccount>>,
    // @note Make sure to create these accounts on a separate previous instruction
    #[account(mut,
        associated_token::mint = reserve_token,
        associated_token::authority = signer,
    )]
    pub referral_reserve_account: Option<Box<Account<'info, TokenAccount>>>,
    // @note Make sure to create these accounts on a separate previous instruction
    #[account(mut,
        associated_token::mint = curve_token,
        associated_token::authority = signer,
    )]
    pub user_curve_holder: Box<Account<'info, TokenAccount>>,

    #[account(mut,
        seeds = [constants::PLACEHOLDER, curve_token.key().as_ref()],
        bump,
    )]
    pub placeholder_mint: Box<Account<'info, Mint>>,
    pub curve_token: Box<Account<'info, Mint>>,
    pub reserve_token: Box<Account<'info, Mint>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EndCurve<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateGlobalFee<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut,
        seeds = [constants::GLOBAL],
        bump
    )]
    pub global_info: Account<'info, GlobalInfo>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(test_id: u64)]
pub struct TestCurveAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(init_if_needed,
        payer = signer,
        seeds = [constants::CURVE, &test_id.to_le_bytes()],
        bump,
        space = 8 + std::mem::size_of::<TestCurve>()
    )]
    pub test_curve: Box<Account<'info, TestCurve>>,
    pub system_program: Program<'info, System>,
}

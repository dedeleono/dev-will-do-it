#![allow(clippy::result_large_err)]
pub mod data_accounts;
pub mod errors;
pub mod events;
use anchor_lang::{
    prelude::*,
    solana_program::{clock::Clock, program::invoke_signed},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, mint_to, transfer, Burn, Mint, MintTo, Token, TokenAccount, Transfer},
};
use data_accounts::*;
use errors::*;
use events::*;
use num_bigint::BigUint;
use num_traits::{ToPrimitive, Zero};
use spl_math::precise_number::PreciseNumber;

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
}

#[program]
pub mod dwdi_programs {
    use anchor_lang::solana_program::system_instruction;

    use super::*;

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
        curve_data.slope_numerator = params.slope_num;
        curve_data.slope_denominator = params.slope_den;
        curve_data.liquidity_supply = params.liquidity_supply;
        curve_data.status = CurveStatus::Init;
        curve_data.platform_fee = ctx.accounts.global_info.platform_fee_basis;
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
    // @todo check that buys are within the bounds of the curve.
    pub fn buy_or_sell(ctx: Context<BuyOrSell>, amount: u64, buy_or_sell: bool) -> Result<()> {
        let curve_data = &mut ctx.accounts.curve_data;
        // Check reserve token
        if ctx.accounts.reserve_token.key() != curve_data.reserve_token {
            return err!(DwdiErrors::InvalidReserveToken);
        }
        match curve_data.status {
            CurveStatus::Init => {
                if ctx.accounts.signer.key() != curve_data.dev {
                    return err!(DwdiErrors::CurveNotStarted);
                }
            }
            CurveStatus::Ended | CurveStatus::Success => return err!(DwdiErrors::CurveEnded),
            _ => (),
        }
        // BUY/Sell LOGIC
        match buy_or_sell {
            // BUY LOGIC
            true => {
                let mut transfer_amount = amount;
                //  Referral fee calculation (if referral exists)
                match &mut ctx.accounts.referral_reserve_account {
                    Some(referral_reserve_account) => {
                        if referral_reserve_account.owner == ctx.accounts.signer.key() {
                            return err!(DwdiErrors::ReferralIsSigner);
                        }
                        let referral_fee =
                            transfer_amount * curve_data.referral_basis / constants::PERCENT_BASIS;
                        transfer_amount -= referral_fee;
                        // Transfer Referral Fee from signer to referral
                        if referral_fee > 0 {
                            match transfer(
                                CpiContext::new(
                                    ctx.accounts.token_program.to_account_info(),
                                    Transfer {
                                        from: ctx.accounts.user_reserve_holder.to_account_info(),
                                        to: referral_reserve_account.to_account_info(),
                                        authority: ctx.accounts.signer.to_account_info(),
                                    },
                                ),
                                referral_fee,
                            ) {
                                Ok(_) => (),
                                Err(_) => return err!(DwdiErrors::ReferralFeeTransferFailed),
                            }
                        }
                    }
                    None => (),
                }
                // Platform fee
                let platform_fee =
                    transfer_amount * curve_data.platform_fee / constants::PERCENT_BASIS;
                transfer_amount -= platform_fee;
                // Transfer Platform fee to fee receiver
                if ctx.accounts.protocol_fee_receiver.owner != ctx.accounts.global_info.owner {
                    return err!(DwdiErrors::InvalidFeeReceiver);
                }
                match transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.user_reserve_holder.to_account_info(),
                            to: ctx.accounts.protocol_fee_receiver.to_account_info(),
                            authority: ctx.accounts.signer.to_account_info(),
                        },
                    ),
                    platform_fee,
                ) {
                    Ok(_) => (),
                    Err(_) => return err!(DwdiErrors::ReserveTokenProtocolFeeTransferFailed),
                }
                // Calculate Curve Token Amount
                let curve_token_amount = calculate_tokens_out(
                    ctx.accounts.reserve_holder.amount,
                    ctx.accounts.reserve_holder.amount + transfer_amount,
                    curve_data.slope_numerator,
                    curve_data.slope_denominator,
                )?;
                // @todo fix this to hit a goal amount.
                // @todo CURVE should have a SOL goal amount.
                let stop_buys =
                    ctx.accounts.reserve_holder.amount + transfer_amount >= 160_000_000_000;
                if stop_buys {
                    curve_data.status = CurveStatus::Success;
                }

                // Transfer ReserveToken to reserve_holder
                match transfer(
                    CpiContext::new(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.user_reserve_holder.to_account_info(),
                            to: ctx.accounts.reserve_holder.to_account_info(),
                            authority: ctx.accounts.signer.to_account_info(),
                        },
                    ),
                    transfer_amount,
                ) {
                    Ok(_) => (),
                    Err(_) => return err!(DwdiErrors::ReserveTokenTransferFailed),
                }
                match curve_data.vesting_basis {
                    // No Vesting transfer tokens directly
                    0 => {
                        let seeds = &[
                            constants::CURVE_HOLDER,
                            &ctx.accounts.curve_token.key().to_bytes(),
                            &[ctx.bumps.curve_holder],
                        ];
                        let signer = [&seeds[..]];
                        match transfer(
                            CpiContext::new_with_signer(
                                ctx.accounts.token_program.to_account_info(),
                                Transfer {
                                    from: ctx.accounts.curve_holder.to_account_info(),
                                    to: ctx.accounts.user_curve_holder.to_account_info(),
                                    authority: ctx.accounts.curve_holder.to_account_info(),
                                },
                                &signer,
                            ),
                            curve_token_amount,
                        ) {
                            Ok(_) => (),
                            Err(_) => return err!(DwdiErrors::CurveTokenTransferFailed),
                        }
                    }
                    // Vesting - mint placeholder tokens
                    _ => {
                        let seeds = &[
                            constants::PLACEHOLDER,
                            &ctx.accounts.curve_token.key().to_bytes(),
                            &[ctx.bumps.placeholder_mint],
                        ];
                        let signer = [&seeds[..]];
                        // Mint placeholder tokens to user
                        let mint_res = mint_to(
                            CpiContext::new_with_signer(
                                ctx.accounts.token_program.to_account_info(),
                                MintTo {
                                    mint: ctx.accounts.placeholder_mint.to_account_info(),
                                    to: ctx.accounts.user_placeholder_curve.to_account_info(),
                                    authority: ctx.accounts.placeholder_mint.to_account_info(),
                                },
                                &signer,
                            ),
                            curve_token_amount,
                        );
                        match mint_res {
                            Ok(_) => (),
                            Err(_) => return err!(DwdiErrors::PlaceholderMintError),
                        }
                    }
                }
                emit!(BuyEvent {
                    curve_token: ctx.accounts.curve_token.key(),
                    amount_bought: curve_token_amount,
                    amount_paid: amount,
                    buyer: ctx.accounts.signer.key(),
                });
            }
            // SELL LOGIC
            false => {
                //Sell Logic
                match curve_data.vesting_basis {
                    0 => {
                        // Transfer tokens from user to curve_holder
                        match transfer(
                            CpiContext::new(
                                ctx.accounts.token_program.to_account_info(),
                                Transfer {
                                    from: ctx.accounts.user_curve_holder.to_account_info(),
                                    to: ctx.accounts.curve_holder.to_account_info(),
                                    authority: ctx.accounts.signer.to_account_info(),
                                },
                            ),
                            amount,
                        ) {
                            Ok(_) => (),
                            Err(_) => return err!(DwdiErrors::ReserveTokenTransferFailed),
                        }
                    }
                    _ => {
                        // Burn placeholder tokens
                        match burn(
                            CpiContext::new(
                                ctx.accounts.token_program.to_account_info(),
                                Burn {
                                    mint: ctx.accounts.placeholder_mint.to_account_info(),
                                    from: ctx.accounts.user_placeholder_curve.to_account_info(),
                                    authority: ctx.accounts.signer.to_account_info(),
                                },
                            ),
                            amount,
                        ) {
                            Ok(_) => (),
                            Err(_) => return err!(DwdiErrors::PlaceholderBurnError),
                        }
                    }
                }
                // Transfer tokens in or BURN placeholder based on vesting_basis existence
                let mut reserve_token_amount = calculate_reserve_out(
                    ctx.accounts.reserve_holder.amount,
                    amount,
                    curve_data.slope_numerator,
                    curve_data.slope_denominator,
                )?;
                // Get platform fee
                let platform_fee =
                    reserve_token_amount * curve_data.platform_fee / constants::PERCENT_BASIS;
                reserve_token_amount -= platform_fee;
                // Transfer Platform fee to fee receiver
                if ctx.accounts.protocol_fee_receiver.owner != ctx.accounts.global_info.owner {
                    return err!(DwdiErrors::InvalidFeeReceiver);
                }
                let seeds = &[
                    constants::RESERVE_HOLDER,
                    &ctx.accounts.reserve_token.key().to_bytes(),
                    &[ctx.bumps.reserve_holder],
                ];
                let signer = [&seeds[..]];

                if platform_fee > 0 {
                    match transfer(
                        CpiContext::new_with_signer(
                            ctx.accounts.token_program.to_account_info(),
                            Transfer {
                                from: ctx.accounts.reserve_holder.to_account_info(),
                                to: ctx.accounts.protocol_fee_receiver.to_account_info(),
                                authority: ctx.accounts.reserve_holder.to_account_info(),
                            },
                            &signer,
                        ),
                        platform_fee,
                    ) {
                        Ok(_) => (),
                        Err(_) => return err!(DwdiErrors::ReserveTokenProtocolFeeTransferFailed),
                    }
                }
                // Collect and transfer jeet tears
                if ctx.accounts.curve_data.sell_fee > 0 {
                    let sell_fee = ctx.accounts.curve_data.sell_fee;
                    let jeet_tears = reserve_token_amount * sell_fee / constants::PERCENT_BASIS;
                    reserve_token_amount -= jeet_tears;
                    if jeet_tears > 0 {
                        match transfer(
                            CpiContext::new_with_signer(
                                ctx.accounts.token_program.to_account_info(),
                                Transfer {
                                    from: ctx.accounts.reserve_holder.to_account_info(),
                                    to: ctx.accounts.jeet_tears.to_account_info(),
                                    authority: ctx.accounts.reserve_holder.to_account_info(),
                                },
                                &signer,
                            ),
                            jeet_tears,
                        ) {
                            Ok(_) => (),
                            Err(_) => return err!(DwdiErrors::JeetTearsFailedToTransfer),
                        }
                    }
                }
                // Transfer Reserve to User
                match transfer(
                    CpiContext::new_with_signer(
                        ctx.accounts.token_program.to_account_info(),
                        Transfer {
                            from: ctx.accounts.reserve_holder.to_account_info(),
                            to: ctx.accounts.user_reserve_holder.to_account_info(),
                            authority: ctx.accounts.reserve_holder.to_account_info(),
                        },
                        &signer,
                    ),
                    reserve_token_amount,
                ) {
                    Ok(_) => (),
                    Err(_) => return err!(DwdiErrors::ReserveTokenTransferFailed),
                }
                emit!(SellEvent {
                    curve_token: ctx.accounts.curve_token.key(),
                    amount_sold: amount,
                    amount_received: reserve_token_amount,
                    seller: ctx.accounts.signer.key(),
                });
            }
        }

        Ok(())
    }

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
}

// fn calculate_price(
//     current_supply: &PreciseNumber,
//     slope_numerator: &PreciseNumber,
//     slope_denominator: &PreciseNumber,
// ) -> Result<PreciseNumber> {
//     let supply_squared = current_supply
//         .checked_mul(current_supply)
//         .ok_or(DwdiErrors::MathOverflow)?;
//     let price = supply_squared
//         .checked_mul(slope_numerator)
//         .ok_or(DwdiErrors::MathOverflow)?
//         .checked_div(slope_denominator)
//         .ok_or(DwdiErrors::MathOverflow)?;
//     Ok(price)
// }

// fn calculate_sol_to_buy_tokens(
//     current_supply: &PreciseNumber,
//     tokens_to_buy: &PreciseNumber,
//     slope_numerator: &PreciseNumber,
//     slope_denominator: &PreciseNumber,
// ) -> Result<PreciseNumber> {
//     let final_supply = current_supply
//         .checked_add(tokens_to_buy)
//         .ok_or(DwdiErrors::MathOverflow)?;
//     let initial_price = calculate_price(current_supply, slope_numerator, slope_denominator)?;
//     let final_price = calculate_price(&final_supply, slope_numerator, slope_denominator)?;
//     let cost = final_price
//         .checked_sub(&initial_price)
//         .ok_or(DwdiErrors::MathOverflow)?;
//     Ok(cost)
// }

// fn calculate_sol_to_sell_tokens(
//     current_supply: &PreciseNumber,
//     tokens_to_sell: &PreciseNumber,
//     slope_numerator: &PreciseNumber,
//     slope_denominator: &PreciseNumber,
// ) -> Result<PreciseNumber> {
//     let final_supply = current_supply
//         .checked_sub(tokens_to_sell)
//         .ok_or(DwdiErrors::MathOverflow)?;
//     let initial_price = calculate_price(current_supply, slope_numerator, slope_denominator)?;
//     let final_price = calculate_price(&final_supply, slope_numerator, slope_denominator)?;
//     let proceeds = initial_price
//         .checked_sub(&final_price)
//         .ok_or(DwdiErrors::MathOverflow)?;
//     Ok(proceeds)
// }

// fn calculate_curve_token_amount_out(
//     reserve_in_amount: u64,
//     current_supply: u64,
//     liquidity_supply: u64,
//     slope_numerator: u64,
//     slope_denominator: u64,
//     max_tx_tokens: u64,
// ) -> Result<(u64, bool)> {
//     let current_supply_precise = PreciseNumber::new(current_supply.into()).unwrap();
//     let reserve_in_precise = PreciseNumber::new(reserve_in_amount.into()).unwrap();
//     let slope_numerator_precise = PreciseNumber::new(slope_numerator.into()).unwrap();
//     let slope_denominator_precise = PreciseNumber::new(slope_denominator.into()).unwrap();

//     let tokens_out_precise = calculate_sol_to_buy_tokens(
//         &current_supply_precise,
//         &reserve_in_precise,
//         &slope_numerator_precise,
//         &slope_denominator_precise,
//     )?;
//     let tokens_out = tokens_out_precise.to_imprecise().unwrap() as u64;
//     let remaining_supply = current_supply - tokens_out;

//     if max_tx_tokens > 0 && tokens_out > max_tx_tokens {
//         return err!(DwdiErrors::MaxTxTokens);
//     }
//     let limit_reached = approx_equal(remaining_supply, liquidity_supply, constants::ONE_TOKEN);
//     Ok((tokens_out, limit_reached))
// }

// fn approx_equal(a: u64, b: u64, margin: u64) -> bool {
//     if a > b {
//         a - b <= margin
//     } else {
//         b - a <= margin
//     }
// }

// fn calculate_reserve_token_amount_out(
//     curve_in_amount: u64,
//     current_supply: u64,
//     slope_numerator: u64,
//     slope_denominator: u64,
//     max_tx_tokens: u64,
// ) -> Result<u64> {
//     if max_tx_tokens > 0 && curve_in_amount > max_tx_tokens {
//         return err!(DwdiErrors::MaxTxTokens);
//     }
//     let current_supply_precise = PreciseNumber::new(current_supply.into()).unwrap();
//     let curve_in_precise = PreciseNumber::new(curve_in_amount.into()).unwrap();
//     let slope_numerator_precise = PreciseNumber::new(slope_numerator.into()).unwrap();
//     let slope_denominator_precise = PreciseNumber::new(slope_denominator.into()).unwrap();

//     let reserve_out_precise = calculate_sol_to_sell_tokens(
//         &current_supply_precise,
//         &curve_in_precise,
//         &slope_numerator_precise,
//         &slope_denominator_precise,
//     )?;
//     let reserve_out = reserve_out_precise.to_imprecise().unwrap() as u64;

//     Ok(reserve_out)
// }

fn calculate_tokens_out(
    reserve_before: u64,
    reserve_after: u64,
    numerator: u64,
    denominator: u64,
) -> Result<u64> {
    let r0 = PreciseNumber::new(reserve_before.into()).unwrap();
    let r1 = PreciseNumber::new(reserve_after.into()).unwrap();
    let exponent = 3;
    let reg_exponent = 2;
    let precise_exponent = PreciseNumber::new(exponent.into()).unwrap();
    let mut num = PreciseNumber::new(numerator.into()).unwrap();
    let mut den = PreciseNumber::new(denominator.into()).unwrap();

    let mut ans = r1
        .checked_pow(exponent)
        .ok_or(DwdiErrors::MathOverflow)
        .unwrap();
    ans = ans
        .checked_sub(
            &r0.checked_pow(exponent)
                .ok_or(DwdiErrors::MathOverflow)
                .unwrap(),
        )
        .ok_or(DwdiErrors::MathOverflow)
        .unwrap();
    num = num
        .checked_pow(reg_exponent)
        .ok_or(DwdiErrors::MathOverflow)
        .unwrap();
    den = den
        .checked_pow(reg_exponent)
        .ok_or(DwdiErrors::MathOverflow)
        .unwrap();
    ans = ans
        .checked_mul(&num)
        .ok_or(DwdiErrors::MathOverflow)
        .unwrap()
        .checked_div(&den)
        .ok_or(DwdiErrors::MathOverflow)
        .unwrap()
        .checked_div(&precise_exponent)
        .ok_or(DwdiErrors::MathOverflow)
        .unwrap();
    Ok(ans.to_imprecise().unwrap() as u64)
}

fn calculate_reserve_out(
    reserve_before: u64,
    tokens_in: u64,
    numerator: u64,
    denominator: u64,
) -> Result<u64> {
    let r1 = BigUint::from(reserve_before);
    let t = BigUint::from(tokens_in);
    let num = BigUint::from(numerator);
    let den = BigUint::from(denominator);

    // Calculate (t * 3 * den^2) / num^2
    let numerator = t * 3u32 * &den * &den;
    let denominator = &num * &num;

    let div_result = numerator / denominator;

    // Calculate r1^3 - div_result
    let r1_cubed = &r1 * &r1 * &r1;
    let result = r1_cubed - div_result;

    // Perform manual cube root calculation
    let cbrt_result = cube_root(result);

    // Difference between reserve_before and cbrt_result
    Ok(reserve_before - cbrt_result.to_u64().unwrap())
}

fn cube_root(n: BigUint) -> BigUint {
    if n.is_zero() {
        return BigUint::zero();
    }

    let mut x = n.clone();
    let mut y = (x.clone() + 2u32) / 3u32;

    while y < x {
        x = y.clone();
        y = (2u32 * x.clone() + n.clone() / (x.clone() * x.clone())) / 3u32;
    }

    x
}

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

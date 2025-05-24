use anchor_lang::prelude::*;
#[event]
pub struct CreateCurveEvent {
    pub curve_token: Pubkey,
    pub reserve_token: Pubkey,
    pub curve_address: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct BuyEvent {
    pub curve_token: Pubkey,
    pub amount_bought: u64,
    pub amount_paid: u64,
    pub buyer: Pubkey,
}

#[event]
pub struct SellEvent {
    pub curve_token: Pubkey,
    pub amount_sold: u64,
    pub amount_received: u64,
    pub seller: Pubkey,
}

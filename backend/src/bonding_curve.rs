use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use std::collections::HashMap;

#[derive(Debug)]
struct Token {
    symbol: String,
    /// Initial price in SOL
    p0: Decimal,
    /// Price increase rate
    k: Decimal,
    /// Current supply of the token
    supply: Decimal,
    /// Maximum supply of the token
    total_supply: Decimal,
}

impl Token {
    /// Create a new token with initial parameters
    fn new(symbol: String, p0: Decimal, k: Decimal, total_supply: Decimal) -> Self {
        Token {
            symbol,
            p0,
            k,
            supply: Decimal::ZERO,
            total_supply,
        }
    }

    /// Calculate the price at a given supply
    fn price_at_supply(&self, supply: Decimal) -> Decimal {
        self.p0 + self.k * supply
    }

    /// Buy tokens with a given amount of SOL
    fn buy_tokens(&mut self, sol_amount: Decimal) -> Decimal {
        let mut tokens_bought = Decimal::ZERO;
        let mut remaining_sol = sol_amount;

        while remaining_sol > Decimal::ZERO && self.supply < self.total_supply {
            let current_price = self.price_at_supply(self.supply);
            if remaining_sol >= current_price {
                tokens_bought += Decimal::ONE;
                self.supply += Decimal::ONE;
                remaining_sol -= current_price;
            } else {
                let additional_tokens = remaining_sol / current_price;
                tokens_bought += additional_tokens;
                self.supply += additional_tokens;
                break;
            }
        }

        tokens_bought
    }

    /// Sell tokens for SOL
    fn sell_tokens(&mut self, token_amount: Decimal) -> Decimal {
        let mut tokens_to_sell = token_amount;
        let mut sol_received = Decimal::ZERO;

        while tokens_to_sell > Decimal::ZERO && self.supply > Decimal::ZERO {
            let current_price = self.price_at_supply(self.supply);
            sol_received += current_price;
            self.supply -= Decimal::ONE;
            tokens_to_sell -= Decimal::ONE;
        }

        sol_received
    }
}

struct Platform {
    tokens: HashMap<String, Token>,
    p0: Decimal,
    k: Decimal,
    total_supply: Decimal,
}

impl Platform {
    /// Create a new platform with bonding curve parameters
    fn new(p0: Decimal, k: Decimal, total_supply: Decimal) -> Self {
        Platform {
            tokens: HashMap::new(),
            p0,
            k,
            total_supply,
        }
    }

    /// Launch a new token on the platform
    fn launch_token(&mut self, symbol: &str) {
        let token = Token::new(
            symbol.to_string(),
            self.p0,
            self.k,
            self.total_supply,
        );
        self.tokens.insert(symbol.to_string(), token);
    }

    /// Get a reference to a token
    fn get_token(&self, symbol: &str) -> Option<&Token> {
        self.tokens.get(symbol)
    }

    /// Get a mutable reference to a token
    fn get_token_mut(&mut self, symbol: &str) -> Option<&mut Token> {
        self.tokens.get_mut(symbol)
    }
}

fn test_platform() {
    let initial_price = dec!(0.01);
    let price_increase_rate = dec!(0.001);
    let total_supply = Decimal::new(1_000_000_000, 0); // 1 billion tokens

    let mut platform = Platform::new(initial_price, price_increase_rate, total_supply);

    // Launch a new token
    platform.launch_token("FCO");

    // Example of buying and selling tokens
    if let Some(token) = platform.get_token_mut("FCO") {
        let sol_to_spend = dec!(1.0);
        let fco_tokens_bought = token.buy_tokens(sol_to_spend);
        println!("Bought {} FCO tokens for {} SOL", fco_tokens_bought, sol_to_spend);

        let fco_to_sell = Decimal::new(10_000_000, 0); // 10 million tokens
        let sol_received = token.sell_tokens(fco_to_sell);
        println!("Sold {} FCO tokens for {} SOL", fco_to_sell, sol_received);
    }
}

# DevWillDoIt Program

## Functions

All function with which users will interact with the program. These functions are all for modifying the state of the program and none are read-only.

### Create Curve

#### Limitations

Could not create `reserve_holder` in the Accounts due to stack limit being exceeded. This account MUST be created on the first BUY.

### Buy Or Sell

Same function is used to swap from one token to another. This function will take either `CURVE_TOKEN` or `RESEREVE_TOKEN` as the input `amount` and calculate the correct amount to swap for the other token.

### EndCurve

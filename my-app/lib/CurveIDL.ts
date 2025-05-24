/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dwdi_programs.json`.
 */
/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dwdi_programs.json`.
 */
export type IDLType = {
  "address": "HcuMHMV2iySZmGGGNvtZYaDGF1W2hJPuDzkWKajMrhJx",
  "metadata": {
    "name": "dwdiPrograms",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyOrSell",
      "discriminator": [
        27,
        255,
        35,
        31,
        162,
        1,
        144,
        108
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "curveData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "reserveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  101,
                  114,
                  118,
                  101,
                  95,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "curveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "jeetTears",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  101,
                  101,
                  116,
                  95,
                  116,
                  101,
                  97,
                  114,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "protocolFeeReceiver",
          "writable": true
        },
        {
          "name": "userPlaceholderCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "placeholderMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userReserveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "reserveToken"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "referralReserveAccount",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "reserveToken"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userCurveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "placeholderMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  99,
                  101,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "curveToken"
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "buyOrSell",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimTokens",
      "discriminator": [
        108,
        216,
        210,
        231,
        0,
        212,
        42,
        64
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createCurve",
      "discriminator": [
        169,
        235,
        221,
        223,
        65,
        109,
        120,
        183
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "curveData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "feeReceiver",
          "writable": true
        },
        {
          "name": "curveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "signerCurveHolder",
          "writable": true
        },
        {
          "name": "curveToken"
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "minimalCurveParms"
            }
          }
        }
      ]
    },
    {
      "name": "createCurveAccounts",
      "discriminator": [
        198,
        177,
        177,
        159,
        109,
        151,
        207,
        29
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "placeholderMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  99,
                  101,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "jeetTears",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  101,
                  101,
                  116,
                  95,
                  116,
                  101,
                  97,
                  114,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "curveToken",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createTestCurve",
      "discriminator": [
        12,
        212,
        23,
        180,
        7,
        52,
        161,
        31
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "testCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "testId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "testId",
          "type": "u64"
        },
        {
          "name": "a",
          "type": "f64"
        },
        {
          "name": "b",
          "type": "f64"
        }
      ]
    },
    {
      "name": "enableCurveForAll",
      "discriminator": [
        211,
        26,
        118,
        56,
        92,
        13,
        75,
        63
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "curveData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "placeholderMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  99,
                  101,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "jeetTears",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  101,
                  101,
                  116,
                  95,
                  116,
                  101,
                  97,
                  114,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "curveToken",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "endCurve",
      "discriminator": [
        79,
        52,
        177,
        66,
        88,
        42,
        140,
        84
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "receiver",
          "type": "pubkey"
        },
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "testCurve",
      "discriminator": [
        129,
        89,
        123,
        31,
        136,
        202,
        18,
        167
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "testCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "testId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "testId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "buySell",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateGlobalFee",
      "discriminator": [
        117,
        201,
        15,
        1,
        18,
        130,
        233,
        37
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "globalInfo",
      "discriminator": [
        241,
        51,
        8,
        81,
        11,
        62,
        44,
        62
      ]
    },
    {
      "name": "testCurve",
      "discriminator": [
        76,
        255,
        26,
        240,
        82,
        252,
        7,
        235
      ]
    }
  ],
  "events": [
    {
      "name": "buyEvent",
      "discriminator": [
        103,
        244,
        82,
        31,
        44,
        245,
        119,
        119
      ]
    },
    {
      "name": "createCurveEvent",
      "discriminator": [
        227,
        243,
        131,
        12,
        208,
        18,
        134,
        142
      ]
    },
    {
      "name": "sellEvent",
      "discriminator": [
        62,
        47,
        55,
        10,
        165,
        3,
        220,
        42
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6001,
      "name": "invalidFeeReceiver",
      "msg": "Invalid fee receiver"
    },
    {
      "code": 6002,
      "name": "setupComplete",
      "msg": "Already setup"
    },
    {
      "code": 6003,
      "name": "feeTransferFailed",
      "msg": "Fee transfer failed"
    },
    {
      "code": 6004,
      "name": "invalidReferralAccount",
      "msg": "Invalid referral account"
    },
    {
      "code": 6005,
      "name": "tokenMintFailed",
      "msg": "Token Mint failed"
    },
    {
      "code": 6006,
      "name": "liquiditySupplyExceeded",
      "msg": "Liquidity supply exceeded"
    },
    {
      "code": 6007,
      "name": "maxTxAmountExceeded",
      "msg": "Max TX amount exceeded"
    },
    {
      "code": 6008,
      "name": "referralFeeTransferFailed",
      "msg": "Referral fee transfer failed"
    },
    {
      "code": 6009,
      "name": "reserveTokenTransferFailed",
      "msg": "Reserve Token transfer failed"
    },
    {
      "code": 6010,
      "name": "reserveTokenProtocolFeeTransferFailed",
      "msg": "Reserve Token Protocol fee transfer failed"
    },
    {
      "code": 6011,
      "name": "curveTokenTransferFailed",
      "msg": "Curve Token transfer failed"
    },
    {
      "code": 6012,
      "name": "jeetTearsFailedToTransfer",
      "msg": "Jeet tears failed to Transfer"
    },
    {
      "code": 6013,
      "name": "referralIsSigner",
      "msg": "Referral is signer"
    },
    {
      "code": 6014,
      "name": "placeholderMintError",
      "msg": "Placeholder mint error"
    },
    {
      "code": 6015,
      "name": "placeholderBurnError",
      "msg": "Placeholder burn error"
    },
    {
      "code": 6016,
      "name": "curveNotStarted",
      "msg": "Curve not started"
    },
    {
      "code": 6017,
      "name": "curveEnded",
      "msg": "Curve ended"
    },
    {
      "code": 6018,
      "name": "curveAlreadyEnabled",
      "msg": "Curve already enabled"
    },
    {
      "code": 6019,
      "name": "insufficientSupply",
      "msg": "Insufficient supply of tokens."
    },
    {
      "code": 6020,
      "name": "insufficientReserve",
      "msg": "Insufficient reserve of SOL."
    },
    {
      "code": 6021,
      "name": "mathOverflow",
      "msg": "Math overflow error."
    },
    {
      "code": 6022,
      "name": "maxTxTokens",
      "msg": "Max number of tokens per transaction reached"
    },
    {
      "code": 6023,
      "name": "invalidReserveToken",
      "msg": "Invalid reserve token"
    }
  ],
  "types": [
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dev",
            "type": "pubkey"
          },
          {
            "name": "reserveToken",
            "type": "pubkey"
          },
          {
            "name": "a",
            "type": "f64"
          },
          {
            "name": "b",
            "type": "f64"
          },
          {
            "name": "tokensSold",
            "type": "u64"
          },
          {
            "name": "liquiditySupply",
            "type": "u64"
          },
          {
            "name": "maxTxTokens",
            "type": "u64"
          },
          {
            "name": "sellFee",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "referralBasis",
            "type": "u64"
          },
          {
            "name": "vestingBasis",
            "type": "u64"
          },
          {
            "name": "vestingInterval",
            "type": "i64"
          },
          {
            "name": "vestingStart",
            "type": "i64"
          },
          {
            "name": "curveStart",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "curveStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "buyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "curveToken",
            "type": "pubkey"
          },
          {
            "name": "amountBought",
            "type": "u64"
          },
          {
            "name": "amountPaid",
            "type": "u64"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "createCurveEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "curveToken",
            "type": "pubkey"
          },
          {
            "name": "reserveToken",
            "type": "pubkey"
          },
          {
            "name": "curveAddress",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "curveStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "init"
          },
          {
            "name": "active"
          },
          {
            "name": "success"
          },
          {
            "name": "ended"
          },
          {
            "name": "setup"
          }
        ]
      }
    },
    {
      "name": "globalInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalRaises",
            "type": "u64"
          },
          {
            "name": "processingFee",
            "type": "u64"
          },
          {
            "name": "platformFeeBasis",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "feeReceiver",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "minimalCurveParms",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": "f64"
          },
          {
            "name": "liquiditySupply",
            "type": "u64"
          },
          {
            "name": "maxTxTokens",
            "type": "u64"
          },
          {
            "name": "sellFee",
            "type": "u64"
          },
          {
            "name": "referralBasis",
            "type": "u64"
          },
          {
            "name": "vestingBasis",
            "type": "u64"
          },
          {
            "name": "vestingInterval",
            "type": "i64"
          },
          {
            "name": "vestingStart",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "sellEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "curveToken",
            "type": "pubkey"
          },
          {
            "name": "amountSold",
            "type": "u64"
          },
          {
            "name": "amountReceived",
            "type": "u64"
          },
          {
            "name": "seller",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "testCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokensSold",
            "type": "u64"
          },
          {
            "name": "reserveCollected",
            "type": "u64"
          },
          {
            "name": "a",
            "type": "f64"
          },
          {
            "name": "b",
            "type": "f64"
          }
        ]
      }
    }
  ]
};

export const DwdiPrograms: IDLType ={
  "address": "HcuMHMV2iySZmGGGNvtZYaDGF1W2hJPuDzkWKajMrhJx",
  "metadata": {
    "name": "dwdiPrograms",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyOrSell",
      "discriminator": [
        27,
        255,
        35,
        31,
        162,
        1,
        144,
        108
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "curveData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "reserveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  115,
                  101,
                  114,
                  118,
                  101,
                  95,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "curveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "jeetTears",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  101,
                  101,
                  116,
                  95,
                  116,
                  101,
                  97,
                  114,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "protocolFeeReceiver",
          "writable": true
        },
        {
          "name": "userPlaceholderCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "placeholderMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userReserveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "reserveToken"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "referralReserveAccount",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "reserveToken"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userCurveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "signer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "placeholderMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  99,
                  101,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "curveToken"
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "buyOrSell",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimTokens",
      "discriminator": [
        108,
        216,
        210,
        231,
        0,
        212,
        42,
        64
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createCurve",
      "discriminator": [
        169,
        235,
        221,
        223,
        65,
        109,
        120,
        183
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "curveData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "feeReceiver",
          "writable": true
        },
        {
          "name": "curveHolder",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "signerCurveHolder",
          "writable": true
        },
        {
          "name": "curveToken"
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "minimalCurveParms"
            }
          }
        }
      ]
    },
    {
      "name": "createCurveAccounts",
      "discriminator": [
        198,
        177,
        177,
        159,
        109,
        151,
        207,
        29
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "placeholderMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  99,
                  101,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "jeetTears",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  101,
                  101,
                  116,
                  95,
                  116,
                  101,
                  97,
                  114,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "curveToken",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createTestCurve",
      "discriminator": [
        12,
        212,
        23,
        180,
        7,
        52,
        161,
        31
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "testCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "testId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "testId",
          "type": "u64"
        },
        {
          "name": "a",
          "type": "f64"
        },
        {
          "name": "b",
          "type": "f64"
        }
      ]
    },
    {
      "name": "enableCurveForAll",
      "discriminator": [
        211,
        26,
        118,
        56,
        92,
        13,
        75,
        63
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "curveData",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "placeholderMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  99,
                  101,
                  104,
                  111,
                  108,
                  100,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "jeetTears",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  106,
                  101,
                  101,
                  116,
                  95,
                  116,
                  101,
                  97,
                  114,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "curveToken"
              }
            ]
          }
        },
        {
          "name": "reserveToken"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "curveToken",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "endCurve",
      "discriminator": [
        79,
        52,
        177,
        66,
        88,
        42,
        140,
        84
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "receiver",
          "type": "pubkey"
        },
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "testCurve",
      "discriminator": [
        129,
        89,
        123,
        31,
        136,
        202,
        18,
        167
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "testCurve",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  117,
                  114,
                  118,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "testId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "testId",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "buySell",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateGlobalFee",
      "discriminator": [
        117,
        201,
        15,
        1,
        18,
        130,
        233,
        37
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "globalInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "fee",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bondingCurve",
      "discriminator": [
        23,
        183,
        248,
        55,
        96,
        216,
        172,
        96
      ]
    },
    {
      "name": "globalInfo",
      "discriminator": [
        241,
        51,
        8,
        81,
        11,
        62,
        44,
        62
      ]
    },
    {
      "name": "testCurve",
      "discriminator": [
        76,
        255,
        26,
        240,
        82,
        252,
        7,
        235
      ]
    }
  ],
  "events": [
    {
      "name": "buyEvent",
      "discriminator": [
        103,
        244,
        82,
        31,
        44,
        245,
        119,
        119
      ]
    },
    {
      "name": "createCurveEvent",
      "discriminator": [
        227,
        243,
        131,
        12,
        208,
        18,
        134,
        142
      ]
    },
    {
      "name": "sellEvent",
      "discriminator": [
        62,
        47,
        55,
        10,
        165,
        3,
        220,
        42
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    },
    {
      "code": 6001,
      "name": "invalidFeeReceiver",
      "msg": "Invalid fee receiver"
    },
    {
      "code": 6002,
      "name": "setupComplete",
      "msg": "Already setup"
    },
    {
      "code": 6003,
      "name": "feeTransferFailed",
      "msg": "Fee transfer failed"
    },
    {
      "code": 6004,
      "name": "invalidReferralAccount",
      "msg": "Invalid referral account"
    },
    {
      "code": 6005,
      "name": "tokenMintFailed",
      "msg": "Token Mint failed"
    },
    {
      "code": 6006,
      "name": "liquiditySupplyExceeded",
      "msg": "Liquidity supply exceeded"
    },
    {
      "code": 6007,
      "name": "maxTxAmountExceeded",
      "msg": "Max TX amount exceeded"
    },
    {
      "code": 6008,
      "name": "referralFeeTransferFailed",
      "msg": "Referral fee transfer failed"
    },
    {
      "code": 6009,
      "name": "reserveTokenTransferFailed",
      "msg": "Reserve Token transfer failed"
    },
    {
      "code": 6010,
      "name": "reserveTokenProtocolFeeTransferFailed",
      "msg": "Reserve Token Protocol fee transfer failed"
    },
    {
      "code": 6011,
      "name": "curveTokenTransferFailed",
      "msg": "Curve Token transfer failed"
    },
    {
      "code": 6012,
      "name": "jeetTearsFailedToTransfer",
      "msg": "Jeet tears failed to Transfer"
    },
    {
      "code": 6013,
      "name": "referralIsSigner",
      "msg": "Referral is signer"
    },
    {
      "code": 6014,
      "name": "placeholderMintError",
      "msg": "Placeholder mint error"
    },
    {
      "code": 6015,
      "name": "placeholderBurnError",
      "msg": "Placeholder burn error"
    },
    {
      "code": 6016,
      "name": "curveNotStarted",
      "msg": "Curve not started"
    },
    {
      "code": 6017,
      "name": "curveEnded",
      "msg": "Curve ended"
    },
    {
      "code": 6018,
      "name": "curveAlreadyEnabled",
      "msg": "Curve already enabled"
    },
    {
      "code": 6019,
      "name": "insufficientSupply",
      "msg": "Insufficient supply of tokens."
    },
    {
      "code": 6020,
      "name": "insufficientReserve",
      "msg": "Insufficient reserve of SOL."
    },
    {
      "code": 6021,
      "name": "mathOverflow",
      "msg": "Math overflow error."
    },
    {
      "code": 6022,
      "name": "maxTxTokens",
      "msg": "Max number of tokens per transaction reached"
    },
    {
      "code": 6023,
      "name": "invalidReserveToken",
      "msg": "Invalid reserve token"
    }
  ],
  "types": [
    {
      "name": "bondingCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dev",
            "type": "pubkey"
          },
          {
            "name": "reserveToken",
            "type": "pubkey"
          },
          {
            "name": "a",
            "type": "f64"
          },
          {
            "name": "b",
            "type": "f64"
          },
          {
            "name": "tokensSold",
            "type": "u64"
          },
          {
            "name": "liquiditySupply",
            "type": "u64"
          },
          {
            "name": "maxTxTokens",
            "type": "u64"
          },
          {
            "name": "sellFee",
            "type": "u64"
          },
          {
            "name": "platformFee",
            "type": "u64"
          },
          {
            "name": "referralBasis",
            "type": "u64"
          },
          {
            "name": "vestingBasis",
            "type": "u64"
          },
          {
            "name": "vestingInterval",
            "type": "i64"
          },
          {
            "name": "vestingStart",
            "type": "i64"
          },
          {
            "name": "curveStart",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "curveStatus"
              }
            }
          }
        ]
      }
    },
    {
      "name": "buyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "curveToken",
            "type": "pubkey"
          },
          {
            "name": "amountBought",
            "type": "u64"
          },
          {
            "name": "amountPaid",
            "type": "u64"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "createCurveEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "curveToken",
            "type": "pubkey"
          },
          {
            "name": "reserveToken",
            "type": "pubkey"
          },
          {
            "name": "curveAddress",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "curveStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "init"
          },
          {
            "name": "active"
          },
          {
            "name": "success"
          },
          {
            "name": "ended"
          },
          {
            "name": "setup"
          }
        ]
      }
    },
    {
      "name": "globalInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalRaises",
            "type": "u64"
          },
          {
            "name": "processingFee",
            "type": "u64"
          },
          {
            "name": "platformFeeBasis",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "feeReceiver",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "minimalCurveParms",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": "f64"
          },
          {
            "name": "liquiditySupply",
            "type": "u64"
          },
          {
            "name": "maxTxTokens",
            "type": "u64"
          },
          {
            "name": "sellFee",
            "type": "u64"
          },
          {
            "name": "referralBasis",
            "type": "u64"
          },
          {
            "name": "vestingBasis",
            "type": "u64"
          },
          {
            "name": "vestingInterval",
            "type": "i64"
          },
          {
            "name": "vestingStart",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "sellEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "curveToken",
            "type": "pubkey"
          },
          {
            "name": "amountSold",
            "type": "u64"
          },
          {
            "name": "amountReceived",
            "type": "u64"
          },
          {
            "name": "seller",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "testCurve",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokensSold",
            "type": "u64"
          },
          {
            "name": "reserveCollected",
            "type": "u64"
          },
          {
            "name": "a",
            "type": "f64"
          },
          {
            "name": "b",
            "type": "f64"
          }
        ]
      }
    }
  ]
};

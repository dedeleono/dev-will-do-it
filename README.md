# DevWillDoIt

A different approach to a linear bonding curve launchpad.

## Overview

This monorepo implements a full-stack bonding curve launchpad, including:

- **On-chain contracts** (`dwdi-programs/`): Rust-based Solana programs handling escrow, dynamic pricing, and token issuance.
- **Backend service** (`backend/`): TypeScript/Node.js API server for off-chain logic, user management, and interacting with Solana.
- **Frontend application** (`my-app/`): React (Next.js) web interface for project creation, token purchase, and analytics.

## Features

- Linear bonding curve mechanics on Solana
- Secure escrow and token vault management
- Role-based access and off-chain coordination via REST API
- Responsive web UI with real-time updates

## Prerequisites

- Node.js (v16+)
- Yarn or npm
- Rust (stable toolchain)
- Solana CLI (v1.14+)
- Anchor CLI (if using Anchor for on-chain programs)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/dedeleono/dev-will-do-it.git
   cd dev-will-do-it
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   cd ../my-app
   npm install
   ```

3. **Build & deploy on-chain programs**
   ```bash
   cd dwdi-programs
   # If using Anchor:
   anchor build
   anchor deploy
   # Or with Solana BPF:
   cargo build-sbf
   solana program deploy      target/sbpf-solana-solana/release/libdwdi_programs.so      --program-id path/to/program-keypair.json
   ```

4. **Configure environment variables**
   - Copy `.env.example` in each folder to `.env` and fill in the required values.

5. **Run local services**
   ```bash
   # Start local Solana validator
   solana-test-validator --reset

   # In separate terminals:
   cd backend && npm run dev
   cd my-app && npm run dev
   ```

6. **Access the frontend**
   Open your browser at `http://localhost:3000`

## Repository Layout

```text
.
├── backend/           # Off-chain API service (TypeScript)
├── dwdi-programs/     # Solana smart contracts (Rust)
├── my-app/            # Frontend application (React/Next.js)
├── .gitignore
└── README.md          # This file
```

## Contributing

Contributions welcome! Please open issues for bugs or feature requests and submit PRs against `main`.

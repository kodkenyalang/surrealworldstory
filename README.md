# VerifydIP - Indigenous IP Protection Platform

A decentralized Web3 application for protecting and managing intellectual property rights for indigenous designs using blockchain technology and Story Protocol.

## Overview

VerifydIP empowers indigenous communities to protect their cultural designs and traditional patterns through blockchain-based IP registration, automated royalty distribution, and AI-powered verification systems.

## Key Features

### 🔐 Story Protocol Integration
- Decentralized IP registration and validation
- Automated royalty collection and distribution
- Derivative work tracking and licensing
- Commercial usage licensing framework

### 💰 DeFi Ecosystem
- IDGT (Indigenous Digital Governance Token) 
- Liquid staking for IP tokens
- IP-backed lending and borrowing
- Automated yield generation

### 🤖 AI-Powered Verification
- Design authenticity verification
- Cultural origin validation
- Pattern similarity detection
- Smart contract automation

### 🌐 Web3 Integration
- Multi-chain wallet support (Ethereum, Polygon, Story Protocol)
- Tomo Wallet integration
- Cross-chain asset management
- Decentralized storage

## Technology Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **Framer Motion** for animations
- **Wagmi** for Web3 interactions

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** for data persistence

### Blockchain
- **Story Protocol** for IP management
- **Viem** for Ethereum interactions
- **Ethers.js** for smart contract integration
- **IPFS** for decentralized storage

### AI/ML
- **OpenAI API** for pattern analysis
- **Goat SDK** for agent automation
- Custom verification algorithms

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/verifydip.git
cd verifydip
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/verifydip

# Story Protocol
VITE_STORY_PROTOCOL_RPC=https://testnet.storyrpc.io
VITE_NFT_CONTRACT_ADDRESS=your_nft_contract_address
VITE_ROYALTY_POLICY_LRP=your_royalty_policy_address

# Tomo Wallet
VITE_TOMO_CLIENT_ID=your_tomo_client_id
VITE_TOMO_PROJECT_ID=your_tomo_project_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express server
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Database operations
│   └── idgt-service.ts    # DeFi agent services
├── shared/                # Shared types and schemas
├── utils/                 # Blockchain utilities
│   ├── contracts/         # Smart contract definitions
│   ├── functions/         # Blockchain interaction functions
│   └── defi-agent/        # DeFi automation agents
└── scripts/               # Deployment and testing scripts
```

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users/wallet/:address` - Get user by wallet

### IP Assets
- `POST /api/ip-assets` - Register IP asset
- `GET /api/ip-assets/user/:userId` - Get user's IP assets
- `PATCH /api/ip-assets/:id` - Update IP asset

### Story Protocol
- `POST /api/story/register-ip` - Register IP on Story Protocol
- `POST /api/story/claim-revenue` - Claim revenue from IP

### DeFi Operations
- `POST /api/defi/stake` - Stake tokens
- `POST /api/defi/borrow` - Borrow against IP collateral
- `GET /api/defi/stats` - Get DeFi ecosystem statistics

### IDGT Token
- `POST /api/idgt/register-ip` - Register IP for IDGT rewards
- `POST /api/idgt/pay-royalty` - Pay royalties in IDGT
- `GET /api/idgt/stats` - Get IDGT token statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Indigenous communities for inspiring this project
- Story Protocol for IP infrastructure
- Tomo Inc for wallet integration
- OpenAI for AI capabilities

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for indigenous communities worldwide**
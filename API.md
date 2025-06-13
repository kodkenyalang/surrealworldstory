# API Documentation

VerifydIP provides RESTful APIs for managing IP assets, Story Protocol interactions, and DeFi operations.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require wallet authentication. Include the wallet address in request headers:
```
Authorization: Bearer <wallet_signature>
X-Wallet-Address: <user_wallet_address>
```

## Response Format

All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2025-01-13T10:30:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-13T10:30:00Z"
}
```

## Core Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users/wallet/{address}` - Get user by wallet

### IP Assets
- `POST /api/ip-assets` - Register IP asset with file upload
- `GET /api/ip-assets/user/{userId}` - Get user's IP assets
- `PATCH /api/ip-assets/{id}` - Update IP asset

### Story Protocol
- `POST /api/story/register-ip` - Register IP on Story Protocol
- `POST /api/story/claim-revenue` - Claim revenue from IP

### IDGT Token
- `POST /api/idgt/register-ip` - Register IP for IDGT rewards
- `POST /api/idgt/pay-royalty` - Pay royalties in IDGT
- `GET /api/idgt/user/{address}` - Get user token info
- `GET /api/idgt/stats` - Get IDGT statistics

### DeFi Operations
- `POST /api/defi/stake` - Stake tokens
- `POST /api/defi/borrow` - Borrow against IP collateral
- `GET /api/defi/stats` - Get DeFi ecosystem statistics

## Rate Limits
- General API: 100 requests/minute
- File uploads: 10 requests/minute
- Blockchain operations: 20 requests/minute

## Error Codes
- `INVALID_INPUT` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `WALLET_ERROR` - Wallet connection failed
- `BLOCKCHAIN_ERROR` - Blockchain operation failed
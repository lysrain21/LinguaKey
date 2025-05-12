// ...existing code...
export * from './passkeyUtils';
// export * from './walletService'; // Will be removed

export { LinguaKey } from './linguaKey';
export type { LinguaKeyConfig, CreateWalletDetails, LoadWalletOptions } from './linguaKey';
export { SolanaWallet } from './solanaWallet';
export { Linguafy } from './linguafy';
export type { LinguafyOptions } from './linguafy';

// Re-export types from @solana/web3.js if they are part of your SDK's public API
// ...existing code...
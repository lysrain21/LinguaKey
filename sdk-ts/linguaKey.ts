import { Keypair, Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { createPasskey, getPasskeyAssertion } from './passkeyUtils';
import { SolanaWallet } from './solanaWallet';
// 路径调整：假设 solana 工具函数在项目根目录下的 solana 文件夹中
import { createNewAccount as solanaCreateNewAccount, accountFromSecretKey as solanaAccountFromSecretKey } from '../../solana/account';

export interface LinguaKeyConfig {
    rpId: string;
}

export interface CreateWalletDetails {
    userIdString: string;
    userName: string;
    userDisplayName: string;
    cluster?: string; // e.g., 'mainnet-beta', 'devnet', 'testnet', or a custom RPC URL
}

export interface LoadWalletOptions {
    secretKeyArray: Uint8Array;
    cluster?: string;
}

export class LinguaKey {
    private static RP_ID: string = 'localhost'; // Default Relying Party ID

    public static initialize(config: LinguaKeyConfig): void {
        if (config.rpId) {
            LinguaKey.RP_ID = config.rpId;
        }
    }

    private static getConnection(clusterOrUrl?: string): Connection {
        let endpoint: string;
        if (!clusterOrUrl || ['mainnet-beta', 'devnet', 'testnet'].includes(clusterOrUrl)) {
            endpoint = clusterApiUrl(clusterOrUrl as 'mainnet-beta' | 'devnet' | 'testnet' | undefined);
        } else {
            endpoint = clusterOrUrl; // Assume it's a custom RPC URL
        }
        return new Connection(endpoint, 'confirmed');
    }

    public static async create(details: CreateWalletDetails): Promise<SolanaWallet | null> {
        const connection = LinguaKey.getConnection(details.cluster);
        const credential = await createPasskey(
            LinguaKey.RP_ID,
            details.userIdString,
            details.userName,
            details.userDisplayName
        );

        if (credential && credential.rawId) {
            // For simplicity, we'll use a deterministic approach if possible or a new account.
            // The README implies a direct creation.
            // The original createAccountWithPasskey created a new random account.
            const newAccountKeypair = solanaCreateNewAccount();
            return new SolanaWallet(newAccountKeypair, credential.rawId, connection, LinguaKey.RP_ID);
        }
        return null;
    }

    public static async load(options: LoadWalletOptions): Promise<SolanaWallet | null> {
        const connection = LinguaKey.getConnection(options.cluster);
        // Passkey assertion confirms user presence for loading the associated key.
        // The app is responsible for mapping assertion to the correct secretKeyArray.
        const assertion = await getPasskeyAssertion(LinguaKey.RP_ID);
        if (assertion) {
            const accountKeypair = solanaAccountFromSecretKey(options.secretKeyArray);
            if (accountKeypair) {
                // When loading, we might not have the original credentialId unless stored and retrieved.
                // For wallet operations, the keypair is primary.
                // The assertion itself contains clientDataJSON which might include the credentialId if allowCredentials was used correctly.
                // For now, pass null for credentialId on load if not readily available.
                let credentialId: ArrayBuffer | null = null;
                if (assertion.rawId) {
                    credentialId = assertion.rawId;
                }
                return new SolanaWallet(accountKeypair, credentialId, connection, LinguaKey.RP_ID);
            }
        }
        return null;
    }

    // Expose underlying Solana utilities if direct access is needed
    public static get SolanaUtils() {
        return {
            createNewAccount: solanaCreateNewAccount,
            accountFromSecretKey: solanaAccountFromSecretKey,
        };
    }
}
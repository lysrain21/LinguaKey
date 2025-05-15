export interface PasskeyCredentialRequestOptions {
    challenge: Uint8Array;
    rpId: string;
    userId: Uint8Array;
    userName: string;
    userDisplayName: string;
    authenticators?: PublicKeyCredentialDescriptor[]; // For get
}

export async function createPasskey(
    rpId: string,
    userIdString: string, // Used to generate a unique user ID
    userName: string,
    userDisplayName: string
): Promise<PublicKeyCredential | null> {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    const userId = new TextEncoder().encode(userIdString);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: { id: rpId, name: "My Solana Wallet" }, // rp.name can be customized
        user: {
            id: userId,
            name: userName, // e.g., user@example.com
            displayName: userDisplayName,
        },
        pubKeyCredParams: [
            { type: "public-key", alg: -7 }, // ES256
            { type: "public-key", alg: -257 }, // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "preferred",
        },
        timeout: 60000,
    };
    return navigator.credentials.create({ publicKey: publicKeyCredentialCreationOptions });
}

export async function getPasskeyAssertion(
    rpId: string,
    allowCredentials?: PublicKeyCredentialDescriptor[] // Optional: for specific credentials
): Promise<AuthenticationAssertion | null> {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: rpId,
        allowCredentials: allowCredentials || [], // Allow any associated passkey if not specified
        userVerification: "preferred",
        timeout: 60000,
    };
    return navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions }) as Promise<AuthenticationAssertion | null>;
}

// Define AuthenticationAssertion if not globally available or to be more specific
export interface AuthenticationAssertion extends PublicKeyCredential {
    response: AuthenticatorAssertionResponse;
}
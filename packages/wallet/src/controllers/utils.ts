import { Keypair, Connection, PublicKey } from "@solana/web3.js";

// -------------------- SOLANA FUNCTIONS ---------------------

/**
 * Makes sure a Solana transaction has made it through the network
 * @param connection
 * @param signature
 * @returns
 */
export async function confirmTransaction(
    connection: Connection,
    signature: string
) {
    let startTime = new Date();
    let result = await connection.confirmTransaction(signature, "recent");
    if (result.value.err) {
        throw new Error(
            "Error confirming transaction: " + JSON.stringify(result.value.err)
        );
    }
    console.log(
        "Transaction confirmed after %sms",
        new Date().getTime() - startTime.getTime()
    );
    return result.value;
}

// -------------------- KEYPAIR FUNCTIONS ---------------------
/**
 *
 * @param privateKey The json string from a private key file - or
 * @returns The keypair from the JSON string
 */
export function jsonPrivatekeyToKeypair(privateKey: string) {
    try {
        return Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
    } catch (e) {
        throw new Error("Poorly formatted JSON private key");
    }
}

/**
 * Returns the Solscan URL for a particular publickey
 *
 * @param account - Public Key of the account you want to look at
 * @param cluster - Solana cluster to look at "devnet" | "mainnet-beta" | "testnet"
 * @returns Solcan url
 */
export function accountToExplorer(
    account: PublicKey,
    cluster: "devnet" | "mainnet-beta" | "testnet" = "mainnet-beta"
) {
    return `https://explorer.solana.com/address/${account}?cluster=${cluster}`;
}

/**
 * Checks if the key is a public key or other object
 *
 * @param key anchor.web3.PublicKey | something
 * @returns True if object is a publickey
 */
export function isPublickey(key: PublicKey | any) {
    return (key as PublicKey).encode;
}

// -------------------- DISPLAY FUNCTIONS ---------------------
/**
 *
 * @param address Public Key or String
 * @param chars How many spots you want to show
 * @returns A shortened address
 */
export function shortenAddress(address: string | PublicKey, chars = 4): string {
    return `${address.toString().slice(0, chars)}...${address
        .toString()
        .slice(-chars)}`;
}

// -------------------- WALLET HELPERS ---------------------

/**
 * Creates a random file ( Good for a burner wallet )
 *
 * @param bytes Size of file in bytes
 * @returns File full of random bytes
 */
export function getRandomFile(bytes: number = 64): File {
    const rngBytes = getRandomBytes(bytes);
    const filename = `${bytes[0]}${bytes[0]}${bytes[0]}${bytes[0]}${bytes[0]}.rng`;
    return new File([Buffer.from(rngBytes)], filename);
}

/**
 * Creates a random array of 'bytes' 0x00 -> 0xFF
 *
 * @param bytes how many bytes in the array
 * @returns array of random bytes 0x00 -> 0xFF
 */
export function getRandomBytes(bytes: number): number[] {
    const randomArray = [] as number[];
    for (let i = 0; i < bytes; i++) {
        randomArray.push(Math.floor(Math.random() * 0xff));
    }

    return randomArray;
}

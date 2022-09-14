import { web3, BN } from "@project-serum/anchor";
import { ACCOUNT_FETCH_STATE } from "../models/fetch-response";
import { DEFAULT_CONTRIBUTION, getToll, USER_HASH } from "../models/globals";
import {
    ASSOCIATED_TOKEN_ID,
    EXCALIBUR_DRM_ID,
    SYSTEM_ID,
    SYSTEM_RENT_ID,
    TOKEN_ID,
    METAPLEX_METADATA_ID,
} from "../models/program-ids";
import { getContributorKey } from "./contributor-account";
import {
    fetchMetadata,
    getMetadataEditionKey,
    getMetadataKey,
    getVaultKey,
    MetaplexMetadata,
} from "./metaplex-accounts";
import { DRMProgram } from "./program";

export interface UserAccount {
    key: web3.PublicKey;
    bump: number;
    creationDate: BN;
    owner: web3.PublicKey;
    collectionMint: web3.PublicKey;
    collectionMetadata: web3.PublicKey;
    collectionMasterEdition: web3.PublicKey;
    mediaCreationCount: BN;
    lamportsTotal: BN;
    tollToDistribute: BN;
    tollTotal: BN;
    eternalized: boolean;
    shdwStorage: web3.PublicKey;
}

export interface UserAccountFetchResponse {
    state: ACCOUNT_FETCH_STATE;
    account: UserAccount | undefined;
}

/**
 * Grabs the user key from the owner
 *
 * @param owner The wallet address that created the user
 * @returns PublicKey
 */
export function getUserKey(owner: web3.PublicKey) {
    return web3.PublicKey.findProgramAddress(
        [Buffer.from(USER_HASH), owner.toBuffer()],
        EXCALIBUR_DRM_ID
    );
}

/**
 * Fetches the user account from the account key
 *
 * @param program The DRM Program
 * @param account The user account key
 * @returns UserAccountFetchResponse
 */
export async function fetchUserAccount(
    program: DRMProgram,
    account: web3.PublicKey
) {
    return _fetchUserAccount(program, { account });
}

/**
 * Fetches the user account from a particular owner
 *
 * @param program The DRM Program
 * @param owner The wallet address that created the user
 * @returns UserAccountFetchResponse
 */
export async function fetchUserAccountFromOwner(
    program: DRMProgram,
    owner: web3.PublicKey
) {
    return _fetchUserAccount(program, { owner });
}

/**
 * Fetches the user account from the program's owner
 *
 * @param program The DRM Program
 * @returns UserAccountFetchResponse
 */
export async function fetchUserAccountFromProgram(program: DRMProgram) {
    const owner = program.program.provider.publicKey as web3.PublicKey;
    return _fetchUserAccount(program, { owner });
}

/**
 * Hidden fetch function
 *
 * @param program The DRM Program
 * @param key The account or owner key
 * @returns UserAccountFetchResponse
 */
async function _fetchUserAccount(
    program: DRMProgram,
    key: {
        account?: web3.PublicKey;
        owner?: web3.PublicKey;
    }
) {
    let state = ACCOUNT_FETCH_STATE.NOT_LOADED;
    let account = undefined;

    const fetchKey =
        key.account ??
        (await getUserKey(key.owner ?? web3.PublicKey.default))[0];

    try {
        const fetchData = await program.program.account.userAccount.fetch(
            fetchKey
        );

        account = {
            key: fetchKey,
            bump: fetchData.bump,
            creationDate: fetchData.creationDate,
            owner: fetchData.owner,
            collectionMint: fetchData.collectionMint,
            collectionMetadata: fetchData.collectionMetadata,
            collectionMasterEdition: fetchData.collectionMasterEdition,
            mediaCreationCount: fetchData.mediaCreationCount,
            lamportsTotal: fetchData.lamportsTotal,
            tollToDistribute: fetchData.tollToDistribute,
            tollTotal: fetchData.tollTotal,
            eternalized: fetchData.eternalized,
            shdwStorage: fetchData.shdwStorage,
        } as UserAccount;

        state = ACCOUNT_FETCH_STATE.LOADED;
    } catch (e) {
        state = ACCOUNT_FETCH_STATE.DNE;
    }

    return {
        state,
        account,
    } as UserAccountFetchResponse;
}

/**
 * Create's the user account
 *
 * @param program The DRM Program
 * @param name Max 32 chars
 * @param symbol Max 10 chars
 * @param uri Max 200 chars
 * @param opts
 * @returns Signature
 */
export async function createUserAccount(
    program: DRMProgram,
    name?: string,
    symbol?: string,
    uri?: string,
    opts?: web3.ConfirmOptions
) {
    // ------- CHECKS --------------------------
    const owner = program.program.provider.publicKey;

    if (program.isBurner) {
        throw new Error("Program cannot be a burner");
    }

    if (!owner) {
        throw new Error("Program needs a non-null provider publickey");
    }

    if (name && name.length > 32) {
        throw new Error("Name has a max of 32 charecters");
    }

    if (symbol && symbol.length > 10) {
        throw new Error("Symbol has a max of 10 charecters");
    }

    if (uri && uri.length > 200) {
        throw new Error("Symbol has a max of 200 charecters");
    }

    // ------- GATHER ALL ACCOUNTS -----------------
    const collectionMintKeypair = web3.Keypair.generate();
    const collectionMint = collectionMintKeypair.publicKey;

    const [userAccount, userAccountBump] = await getUserKey(owner);
    const [collectionMetadata] = await getMetadataKey(collectionMint);
    const [collectionMasterEdition] = await getMetadataEditionKey(
        collectionMint
    );
    const userVault = await getVaultKey(collectionMint, userAccount, true);

    // ------- SIGNERS -----------------
    const signers = [collectionMintKeypair];

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        owner, // Signer
        // New Accounts
        userAccount, // UserAccount Data
        userVault, // Vault to mint the collection NFT to
        collectionMint, // Mint account - Signer
        collectionMetadata, // Metadata Account
        collectionMasterEdition, // Master Edition Account
        // Program Accounts
        systemProgram: SYSTEM_ID,
        tokenProgram: TOKEN_ID,
        rent: SYSTEM_RENT_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_ID,
        tokenMetadataProgram: METAPLEX_METADATA_ID,
    };

    // ------- PARAMS -------------------
    const paramBump = userAccountBump;
    const paramNFTInfo = {
        name: name ?? "",
        symbol: symbol ?? "",
        uri: uri ?? "",
    };

    return program.program.methods
        .createUser(paramBump, paramNFTInfo)
        .accounts(accounts)
        .signers(signers)
        .rpc({
            skipPreflight: true,
            ...opts,
        });
}

/**
 * Updates the User's metadata
 *
 * @param program The DRM Program
 * @param user Will use program's user as default
 * @param name Updated name else no change
 * @param symbol Updated symbol else no change
 * @param uri Updated uri else no change
 * @param opts Confirm options
 * @returns
 */
export async function editUserMetadata(
    program: DRMProgram,
    user?: UserAccount,
    name?: string,
    symbol?: string,
    uri?: string,
    opts?: web3.ConfirmOptions
) {
    // ------- CHECKS --------------------------
    const owner = program.program.provider.publicKey;

    if (program.isBurner) {
        throw new Error("Program cannot be a burner");
    }

    if (!owner) {
        throw new Error("Program needs a non-null provider publickey");
    }

    if (name && name.length > 32) {
        throw new Error("Name has a max of 32 charecters");
    }

    if (symbol && symbol.length > 10) {
        throw new Error("Symbol has a max of 10 charecters");
    }

    if (uri && uri.length > 200) {
        throw new Error("Symbol has a max of 200 charecters");
    }

    const userAccountData =
        user ?? (await fetchUserAccountFromOwner(program, owner)).account;
    if (!userAccountData) {
        throw new Error("User account needs to exsist");
    }

    const metadataData = await fetchMetadata(
        program.program.provider.connection,
        userAccountData.collectionMetadata
    );

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        owner, // Signer
        userAccount: userAccountData.key,
        metadata: userAccountData.collectionMetadata,
        // Program Accounts
        tokenMetadataProgram: METAPLEX_METADATA_ID,
    };

    // ------- PARAMS -------------------
    const paramNFTInfo = {
        name: name ?? metadataData.data.name,
        symbol: symbol ?? metadataData.data.name,
        uri: uri ?? metadataData.data.uri,
    };

    return program.program.methods
        .editMetadata(paramNFTInfo)
        .accounts(accounts)
        .rpc({
            skipPreflight: true,
            ...opts,
        });
}

/**
 * Contributes Solana to the User Account
 *
 *
 * @param program The DRM Program
 * @param user Will grab the User from the program as default
 * @param lamports How many to send
 * @param toll  How much of a toll to send
 * @param opts Confirm options
 * @returns Signature
 */
export async function contributeToUser(
    program: DRMProgram,
    user?: UserAccount,
    lamports?: BN,
    toll?: BN,
    opts?: web3.ConfirmOptions
) {
    // ------- CHECKS --------------------------
    const owner = program.program.provider.publicKey;

    if (program.isBurner) {
        throw new Error("Program cannot be a burner");
    }

    if (!owner) {
        throw new Error("Program needs a non-null provider publickey");
    }

    const userAccountData =
        user ?? (await fetchUserAccountFromOwner(program, owner)).account;
    if (!userAccountData) {
        throw new Error("User account needs to exsist");
    }

    const [contributorAccount] = await getContributorKey(
        owner,
        userAccountData.key
    );

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Maybe new account
        contributorAccount,
        // Exsisting Accounts
        contributor: owner, // Signer
        userAccount: userAccountData.key,
        // Program Accounts
        systemProgram: SYSTEM_ID,
    };

    // ------- PARAMS -------------------
    lamports = new BN(lamports ?? DEFAULT_CONTRIBUTION);
    toll = new BN(toll ?? getToll(lamports));

    return program.program.methods
        .contributeToUser({
            lamports,
            toll,
        })
        .accounts(accounts)
        .rpc({
            skipPreflight: true,
            ...opts,
        });
}

/**
 * Checks if the key is a public key or other object
 *
 * @param key anchor.web3.PublicKey | something
 * @returns True if object is a publickey
 */
export function userAccountToString(account: UserAccount) {
    const object = Object(account);
    let string = "";

    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(account, key)) {
            const element = object[key];
            if (element.toNumber) {
                string += `${key}: ${element.toNumber()}\n`;
            } else {
                string += `${key}: ${element.toString()}\n`;
            }
        }
    }

    return string;
}

import { web3, BN } from "@project-serum/anchor";
import { ACCOUNT_FETCH_STATE } from "../models/fetch-response";
import {
    AFFILAITE_HASH,
    DEFAULT_CONTRIBUTION,
    getToll,
    MEDIA_HASH,
} from "../models/globals";

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
import { fetchUserAccountFromOwner, UserAccount } from "./user-account";

export const MAX_PERCENT = 100 * 100;
export const HALF_PERCENT = MAX_PERCENT >> 1;

export interface WorkerDistributionParam {
    name: string;
    wallet: web3.PublicKey;
    percentage: BN;
}
export interface WorkerDistribution {
    wallet: web3.PublicKey;
    percentage: BN;
    lamportsEarned: BN;
    lamportsDistributed: BN;
}
export interface MediaAccount {
    key: web3.PublicKey;
    originalMedia: web3.PublicKey;
    originalUser: web3.PublicKey;
    originalOwner: web3.PublicKey;

    userAccount: web3.PublicKey;
    owner: web3.PublicKey;
    sftMint: web3.PublicKey;
    shdwStorage: web3.PublicKey;
    mediaHash: web3.PublicKey;

    mediaCreationIndex: BN;
    creationDate: BN;
    eternalized: boolean;
    affiliateSplit: BN;

    crankTally: BN;
    lamportsToDistribute: BN;
    lamportsTotal: BN;
    tollToDistribute: BN;
    tollTotal: BN;
    excalToDistribute: BN;
    excalTotal: BN;
    forFutureUse: BN[];
    workerDistributions: WorkerDistribution[];
}

export const NULL_MEDIA_METADATA = {
    name: "Excalibur Podcast",
    symbol: "EXCAL",
    description: "Excalibur Podcast Channel",
    external_url: "https://excal.tv",
} as MetaplexMetadata;

export interface MediaAccountFetchResponse {
    state: ACCOUNT_FETCH_STATE;
    account: MediaAccount | undefined;
}

export function getAffiliateKey(
    originalMediaAccount: web3.PublicKey,
    affiliate: web3.PublicKey
) {
    return web3.PublicKey.findProgramAddress(
        [
            Buffer.from(AFFILAITE_HASH),
            originalMediaAccount.toBuffer(),
            affiliate.toBuffer(),
        ],
        EXCALIBUR_DRM_ID
    );
}

export function getMediaKey(owner: web3.PublicKey, index: BN) {
    return web3.PublicKey.findProgramAddress(
        [
            Buffer.from(MEDIA_HASH),
            Buffer.from(index.toArray("be", 8)),
            owner.toBuffer(),
        ],
        EXCALIBUR_DRM_ID
    );
}

export async function fetchMediaAccount(
    program: DRMProgram,
    account: web3.PublicKey
) {
    return _fetchMediaAccount(program, { account });
}

export async function fetchMediaAccountFromOwnerAndIndex(
    program: DRMProgram,
    owner: web3.PublicKey,
    index: BN
) {
    return _fetchMediaAccount(program, { owner, index });
}

export async function fetchAffiliateAccount(
    program: DRMProgram,
    originalMediaAccount: web3.PublicKey,
    affiliate: web3.PublicKey
) {
    return _fetchMediaAccount(program, { originalMediaAccount, affiliate });
}

async function _fetchMediaAccount(
    program: DRMProgram,
    key: {
        account?: web3.PublicKey;
        owner?: web3.PublicKey;
        index?: BN;
        originalMediaAccount?: web3.PublicKey;
        affiliate?: web3.PublicKey;
    }
) {
    let state = ACCOUNT_FETCH_STATE.NOT_LOADED;
    let account = undefined;

    const fetchKey =
        key.account ??
        (key.affiliate
            ? (
                  await getAffiliateKey(
                      key.originalMediaAccount ?? web3.PublicKey.default,
                      key.affiliate ?? web3.PublicKey.default
                  )
              )[0]
            : (
                  await getMediaKey(
                      key.owner ?? web3.PublicKey.default,
                      key.index ?? new BN(0)
                  )
              )[0]);

    try {
        const fetchData = await program.program.account.mediaAccount.fetch(
            fetchKey
        );

        const distros = [];

        for (const distro of fetchData.workerDistributions as any[]) {
            distros.push({
                wallet: distro.wallet,
                percentage: distro.percentage,
                lamportsEarned: distro.lamportsEarned,
                lamportsDistributed: distro.lamportsDistributed,
            });
        }

        account = {
            key: fetchKey,
            originalMedia: fetchData.originalMedia,
            originalUser: fetchData.originalUser,
            originalOwner: fetchData.originalOwner,
            userAccount: fetchData.userAccount,
            owner: fetchData.owner,
            sftMint: fetchData.sftMint,
            shdwStorage: fetchData.shdwStorage,
            mediaHash: fetchData.mediaHash,
            creationDate: fetchData.creationDate,
            eternalized: fetchData.eternalized,
            affiliateSplit: fetchData.affiliateSplit,
            mediaCreationIndex: fetchData.mediaCreationIndex,
            crankTally: fetchData.crankTally,
            lamportsToDistribute: fetchData.lamportsToDistribute,
            lamportsTotal: fetchData.lamportsTotal,
            tollToDistribute: fetchData.tollToDistribute,
            tollTotal: fetchData.tollTotal,
            excalToDistribute: fetchData.excalToDistribute,
            excalTotal: fetchData.excalTotal,
            forFutureUse: fetchData.forFutureUse,
            workerDistributions: distros,
        } as MediaAccount;

        state = ACCOUNT_FETCH_STATE.LOADED;
    } catch (e) {
        state = ACCOUNT_FETCH_STATE.DNE;
    }

    return {
        state,
        account,
    } as MediaAccountFetchResponse;
}

export async function createMediaAccount(
    program: DRMProgram,
    mediaHash: web3.Keypair,
    distros: WorkerDistributionParam[],
    name?: string,
    symbol?: string,
    uri?: string,
    user?: UserAccount,
    affiliateSplit?: BN,
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

    // ------- GATHER ALL ACCOUNTS -----------------
    const mediaMintKeypair = web3.Keypair.generate();
    const mediaMint = mediaMintKeypair.publicKey;

    const [mediaAccount] = await getMediaKey(
        owner,
        userAccountData.mediaCreationCount
    );
    const [metadata] = await getMetadataKey(mediaMint);
    const [masterEdition] = await getMetadataEditionKey(mediaMint);
    const userVault = await getVaultKey(mediaMint, userAccountData.key, true);

    // ------- SIGNERS -----------------
    const signers = [mediaMintKeypair, mediaHash];

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        owner, // Signer
        userAccount: userAccountData.key,
        collectionMasterEdition: userAccountData.collectionMasterEdition,
        collectionMetadata: userAccountData.collectionMetadata,
        collectionMint: userAccountData.collectionMint,
        // New Accounts
        mediaHashAccount: mediaHash.publicKey,
        mediaAccount,
        mint: mediaMint,
        userVault, // Vault to mint the collection NFT to
        metadata, // Metadata Account
        masterEdition, // Master Edition Account
        // Program Accounts
        systemProgram: SYSTEM_ID,
        tokenProgram: TOKEN_ID,
        rent: SYSTEM_RENT_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_ID,
        tokenMetadataProgram: METAPLEX_METADATA_ID,
    };

    // ------- PARAMS -------------------
    const paramsDistros = [];
    for (const distro of distros) {
        paramsDistros.push({
            wallet: distro.wallet,
            percentage: distro.percentage,
        });
    }
    const paramsAffiliateSplit = new BN(affiliateSplit ?? HALF_PERCENT);
    const paramNFTInfo = {
        name: name ?? "",
        symbol: symbol ?? "",
        uri: uri ?? "",
    };

    await program.program.methods
        .createMedia(paramsDistros, paramsAffiliateSplit, paramNFTInfo)
        .accounts(accounts)
        .signers(signers)
        .rpc({
            skipPreflight: true,
            ...opts,
        });

    return {
        mint: mediaMint,
        vault: userVault,
        media: mediaAccount,
    };
}

export async function createAffiliateAccount(
    program: DRMProgram,
    media: MediaAccount,
    user?: UserAccount,
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

    // ------- GATHER ALL ACCOUNTS -----------------
    const originalMediaAccount = media.originalMedia;
    const [affiliateMediaAccount] = await getAffiliateKey(
        originalMediaAccount,
        owner
    );

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        owner, // Signer
        originalMediaAccount,
        userAccount: userAccountData.key,
        // New Accounts
        affiliateMediaAccount,
        // Program Accounts
        systemProgram: SYSTEM_ID,
    };

    await program.program.methods
        .createAffiliate()
        .accounts(accounts)
        .rpc({
            skipPreflight: true,
            ...opts,
        });

    return {
        affiliate: affiliateMediaAccount,
    };
}

export async function editMediaMetadata(
    program: DRMProgram,
    index: BN,
    media?: MediaAccount,
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

    const userAccountData =
        user ?? (await fetchUserAccountFromOwner(program, owner)).account;
    if (!userAccountData) {
        throw new Error("User account needs to exsist");
    }

    const mediaAccountData =
        media ??
        (await fetchMediaAccountFromOwnerAndIndex(program, owner, index))
            .account;
    if (!mediaAccountData) {
        throw new Error("Media account needs to exsist");
    }

    const metadata = (await getMetadataKey(mediaAccountData.sftMint))[0];

    const metadataData = await fetchMetadata(
        program.program.provider.connection,
        metadata
    );

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        owner, // Signer
        userAccount: userAccountData.key,
        metadata,
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

export async function contributeToMedia(
    program: DRMProgram,
    media: MediaAccount,
    lamports?: BN,
    toll?: BN,
    maxCranks?: number,
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

    const mediaAccountData = media;

    const [contributorAccount] = await getContributorKey(
        owner,
        mediaAccountData.originalMedia
    );

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Maybe new account
        contributorAccount,
        // Exsisting Accounts
        contributor: owner, // Signer
        mediaAccount: mediaAccountData.key,
        // Program Accounts
        systemProgram: SYSTEM_ID,
    };

    // ------- PARAMS -------------------
    lamports = new BN(lamports ?? DEFAULT_CONTRIBUTION);
    toll = new BN(toll ?? getToll(lamports));

    // ------ CRANKS --------------
    let crankCount = maxCranks ?? media.workerDistributions.length;
    const cranks = [];

    for (const distro of media.workerDistributions) {
        if (crankCount-- > 0) {
            cranks.push(
                await distributeToWorkersCrankInstruction(
                    program,
                    distro.wallet,
                    media.key
                )
            );
        }
    }

    return program.program.methods
        .contributeToMedia({
            lamports,
            toll,
        })
        .accounts(accounts)
        .postInstructions(cranks)
        .rpc({
            skipPreflight: true,
            ...opts,
        });
}

export async function distributeToWorkersCrankInstruction(
    program: DRMProgram,
    wallet: web3.PublicKey,
    media: web3.PublicKey
) {
    // ------- CHECKS --------------------------
    const owner = program.program.provider.publicKey;

    if (program.isBurner) {
        throw new Error("Program cannot be a burner");
    }

    if (!owner) {
        throw new Error("Program needs a non-null provider publickey");
    }

    const mediaAccountData = media;

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        mediaAccount: media,
        recipient: wallet,
    };

    return program.program.methods
        .distributeToWorkersCrank()
        .accounts(accounts)
        .instruction();
}

export async function distributeToWorkersCrank(
    program: DRMProgram,
    media: MediaAccount,
    maxCranks: number = 5,
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

    const mediaAccountData = media;

    let recipientDistro = media.workerDistributions.find((distro) => {
        return !distro.lamportsEarned.eq(distro.lamportsDistributed);
    });

    if (!recipientDistro) {
        recipientDistro = media.workerDistributions[0];
    }

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        mediaAccount: mediaAccountData.key,
        recipient: recipientDistro.wallet,
    };

    return program.program.methods
        .distributeToWorkersCrank()
        .accounts(accounts)
        .rpc({
            skipPreflight: true,
            ...opts,
        });
}

export async function printSftFromCreator(
    program: DRMProgram,
    media: MediaAccount,
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

    const mediaAccountData = media;

    // ------- GATHER ALL ACCOUNTS -----------------

    const ownerVault = await getVaultKey(mediaAccountData.sftMint, owner);

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        owner, // Signer
        originalUser: mediaAccountData.originalUser,
        mediaAccount: mediaAccountData.key,
        sftMint: mediaAccountData.sftMint,
        // New Accounts
        ownerVault,
        // Program Accounts
        systemProgram: SYSTEM_ID,
        tokenProgram: TOKEN_ID,
        rent: SYSTEM_RENT_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_ID,
    };

    return program.program.methods
        .printSftFromCreator()
        .accounts(accounts)
        .rpc({
            skipPreflight: true,
            ...opts,
        });
}

export async function printSftFromContributor(
    program: DRMProgram,
    media: MediaAccount,
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

    const mediaAccountData = media;

    // ------- GATHER ALL ACCOUNTS -----------------

    const [contributorAccount] = await getContributorKey(
        owner,
        mediaAccountData.originalMedia
    );
    const contributorVault = await getVaultKey(mediaAccountData.sftMint, owner);

    // ------- ACCOUNTS -----------------
    const accounts = {
        // Exsisting Accounts
        contributor: owner, // Signer
        originalUser: mediaAccountData.originalUser,
        mediaAccount: mediaAccountData.key,
        sftMint: mediaAccountData.sftMint,
        contributorAccount,
        // New Accounts
        contributorVault,
        // Program Accounts
        systemProgram: SYSTEM_ID,
        tokenProgram: TOKEN_ID,
        rent: SYSTEM_RENT_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_ID,
    };

    return program.program.methods
        .printSftFromContributor()
        .accounts(accounts)
        .rpc({
            skipPreflight: true,
            ...opts,
        });
}

// ----------- HELPERS -----------------------
/**
 * Takes in a percent 1.0 to 0.0 and turns it into Solana points
 *
 * It will clamp automatically
 *
 * @param percent 1.0 -> 0.0
 * @returns Solana points BN for distribution split
 */
export function percentToPoints(percent: number) {
    return Math.floor(Math.min(Math.max(percent, 0.0), 1.0) * MAX_PERCENT);
}

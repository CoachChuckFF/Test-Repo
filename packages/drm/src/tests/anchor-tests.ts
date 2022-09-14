import * as anchor from "@project-serum/anchor";
import * as SPL from "@solana/spl-token";
import * as MPL from "@metaplex-foundation/js";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";
import { BN } from "bn.js";
import { ExcaliburDrm } from "../../target/types/excalibur_drm";

const METAPLEX_METADATA_ID = MPL.TokenMetadataProgram.publicKey;
const PRECISION_FACTOR = 3;

const MAX_PERCENT = 100 * 100;
const HALF_PERCENT = MAX_PERCENT >> 1;

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function airdrop(
    program: Program<ExcaliburDrm>,
    to: anchor.web3.PublicKey,
    lamports: number
) {
    return new Promise<string>((resolve, reject) => {
        program.provider.connection
            .requestAirdrop(to, lamports)
            .then((airdropSignature) => {
                program.provider.connection
                    .confirmTransaction(airdropSignature)
                    .then(() => {
                        resolve(
                            `Airdropped ${(
                                lamports / anchor.web3.LAMPORTS_PER_SOL
                            ).toPrecision(PRECISION_FACTOR)} sol`
                        );
                    })
                    .catch((e) => {
                        reject(e);
                    });
            })
            .catch((e) => {
                reject(e);
            });
    });
}

function createTestDistros(amount: number = 1, percentToUser: number = 0.1) {
    const distros = [];
    const percentToGive = MAX_PERCENT - percentToUser * MAX_PERCENT;

    for (let i = 0; i < amount; i++) {
        distros.push({
            wallet: anchor.web3.Keypair.generate().publicKey,
            percentage: new BN((1 / amount) * percentToGive),
        });
    }
    return distros;
}

// seeds = [
//     AFFILIATE_SEED,
//     original_media_account.sft_mint.as_ref(),
//     owner.key().as_ref(),
// ],
async function getUserAccount(
    drmProvider: Program<ExcaliburDrm>,
    owner: anchor.web3.PublicKey
) {
    return await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from("USER"), owner.toBuffer()],
        drmProvider.programId
    );
}

async function getAffiliateAccount(
    drmProvider: Program<ExcaliburDrm>,
    originalMediaAccount: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
) {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("AFFILIATE"),
            originalMediaAccount.toBuffer(),
            owner.toBuffer(),
        ],
        drmProvider.programId
    );
}

async function getMediaAccount(
    drmProvider: Program<ExcaliburDrm>,
    index: anchor.BN,
    owner: anchor.web3.PublicKey
) {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("MEDIA"),
            Buffer.from(index.toArray("be", 8)),
            owner.toBuffer(),
        ],
        drmProvider.programId
    );
}

async function getContributorAccount(
    drmProvider: Program<ExcaliburDrm>,
    contributor: anchor.web3.PublicKey,
    original_media_or_user_account: anchor.web3.PublicKey
) {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("CONTRIBUTOR"),
            contributor.toBuffer(),
            original_media_or_user_account.toBuffer(),
        ],
        drmProvider.programId
    );
}

async function getMetadataAccount(mint: anchor.web3.PublicKey) {
    MPL.TokenMetadataProgram.publicKey.toBuffer();
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            METAPLEX_METADATA_ID.toBuffer(),
            mint.toBuffer(),
        ],
        METAPLEX_METADATA_ID
    );
}

async function getMetadataEditionAccount(mint: anchor.web3.PublicKey) {
    MPL.TokenMetadataProgram.publicKey.toBuffer();
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            Buffer.from("metadata"),
            METAPLEX_METADATA_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
        ],
        METAPLEX_METADATA_ID
    );
}

function accountToSolscan(account: anchor.web3.PublicKey) {
    return `https://solscan.io/token/${account}?cluster=devnet`;
}

function getProgramProvider(
    program: Program<ExcaliburDrm>,
    wallet: anchor.web3.Keypair
): Program<ExcaliburDrm> {
    const newProvider = new anchor.AnchorProvider(
        program.provider.connection,
        new anchor.Wallet(wallet),
        {}
    );

    return new anchor.Program(
        program.idl as anchor.Idl,
        program.programId,
        newProvider
    ) as Program<ExcaliburDrm>;
}

async function mediaAccountToString(
    program: Program<ExcaliburDrm>,
    mediaAccount: anchor.web3.PublicKey
) {
    const accountData = await program.account.mediaAccount.fetch(mediaAccount);
    const distros = accountData.workerDistributions as any[];

    let log = "\n--- Media Account ---\n";

    log += "| Toll Total: " + accountData.tollTotal.toNumber() + "\n";
    log +=
        "| Toll To Distro: " + accountData.tollToDistribute.toNumber() + "\n";
    log += "| Distros: " + distros.length + "\n";

    for (const distro of distros) {
        const wallet = (distro.wallet as anchor.web3.PublicKey)
            .toString()
            .substring(0, 5);
        const percentage =
            ((distro.percentage as anchor.BN).toNumber() / MAX_PERCENT) * 100 +
            "%";
        const lamportsDistributed = (
            (distro.lamportsDistributed as anchor.BN).toNumber() /
            anchor.web3.LAMPORTS_PER_SOL
        ).toPrecision(PRECISION_FACTOR);
        const lamportsEarned = (
            (distro.lamportsEarned as anchor.BN).toNumber() /
            anchor.web3.LAMPORTS_PER_SOL
        ).toPrecision(PRECISION_FACTOR);
        log += `| --- ${wallet} (${percentage}): E${lamportsEarned} D${lamportsDistributed} \n`;
    }

    log += "\n\n";

    return log;
}

describe("Excalibur DRM", async () => {
    // Configure the client to use the local cluster.
    // const provider = anchor.workspace.provider as anchor.AnchorProvider;
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.ExcaliburDrm as Program<ExcaliburDrm>;

    // ------------- USERS ---------------------------
    const creatorWallet = anchor.web3.Keypair.generate();
    const creatorProgramProvider = getProgramProvider(program, creatorWallet);

    const contributorWallet = anchor.web3.Keypair.generate();
    const contributorProgramProvider = getProgramProvider(
        program,
        contributorWallet
    );

    const crankWallet = anchor.web3.Keypair.generate();
    const crankProgramProvider = getProgramProvider(program, crankWallet);

    // ------------- ALLOWANCES ---------------------------
    const QRDonation = anchor.web3.LAMPORTS_PER_SOL * 0.01;

    const creatorStartingBalance = anchor.web3.LAMPORTS_PER_SOL * 0.05;
    let lastCreatorBalance = 0;
    let creatorBalanceTally = 0;

    const contributorStartingBalance = anchor.web3.LAMPORTS_PER_SOL * 0.05;
    const amountPerContribution = anchor.web3.LAMPORTS_PER_SOL * 0.01;
    const tollPerContribution = anchor.web3.LAMPORTS_PER_SOL * 0.0001;
    const contributionCount = 2;

    let lastContributorBalance = 0;
    let contributorBalanceTally = 0;

    const crankStartingBalance = anchor.web3.LAMPORTS_PER_SOL * 0.01;
    let lastCrankBalance = 0;
    let crankBalanceTally = 0;

    // ---------- USER ACCOUNT ------------------------------
    const userMintAccount = anchor.web3.Keypair.generate();
    const [userAccount, userAccountBump] = await getUserAccount(
        creatorProgramProvider,
        creatorWallet.publicKey
    );

    const userVault = await SPL.getAssociatedTokenAddress(
        userMintAccount.publicKey,
        userAccount,
        true
    );

    const [userMetadataAccount] = await getMetadataAccount(
        userMintAccount.publicKey
    );
    const [userMetadataMasterEdition] = await getMetadataEditionAccount(
        userMintAccount.publicKey
    );

    // ---------- MEDIA ACCOUNT ------------------------------
    const mediaHashAccount = anchor.web3.Keypair.generate(); // Hashed Media
    const mediaMintAccount = anchor.web3.Keypair.generate();
    const [mediaAccount, mediaAccountBump] = await getMediaAccount(
        creatorProgramProvider,
        new anchor.BN(0),
        creatorWallet.publicKey
    );
    const userMediaVault = await SPL.getAssociatedTokenAddress(
        mediaMintAccount.publicKey,
        userAccount,
        true
    );

    const [mediaMetadataAccount] = await getMetadataAccount(
        mediaMintAccount.publicKey
    );
    const [mediaMetadataMasterEdition] = await getMetadataEditionAccount(
        mediaMintAccount.publicKey
    );

    // ---------- CONTRIBUTOR USER ACCOUNT ------------------------------
    const contributorUserMintAccount = anchor.web3.Keypair.generate();
    const [contributorUserAccount, contributorUserAccountBump] =
        await getUserAccount(
            contributorProgramProvider,
            contributorWallet.publicKey
        );

    const contributorUserVault = await SPL.getAssociatedTokenAddress(
        contributorUserMintAccount.publicKey,
        contributorUserAccount,
        true
    );

    const [contributorUserMetadataAccount] = await getMetadataAccount(
        contributorUserMintAccount.publicKey
    );
    const [contributorUserMetadataMasterEdition] =
        await getMetadataEditionAccount(contributorUserMintAccount.publicKey);

    const [affiliateMediaAccount] = await getAffiliateAccount(
        contributorProgramProvider,
        mediaAccount,
        contributorWallet.publicKey
    );

    // ---------- Contributor ACCOUNT ------------------------------
    const [contributorAccount, contributorAccountBump] =
        await getContributorAccount(
            contributorProgramProvider,
            contributorWallet.publicKey,
            mediaAccount
        );

    // ---------- SFT ACCOUNTS ------------------------------
    const creatorMediaVaultAccount = await SPL.getAssociatedTokenAddress(
        mediaMintAccount.publicKey,
        creatorWallet.publicKey
    );

    const contributorMediaVaultAccount = await SPL.getAssociatedTokenAddress(
        mediaMintAccount.publicKey,
        contributorWallet.publicKey
    );

    // ---------- COMMUNITY WALLET ------------------------------
    const secretArray = require("/Users/drkrueger/.config/solana/programs/excalibur.json");
    const secret = new Uint8Array(secretArray);
    const communityWallet = anchor.web3.Keypair.fromSecretKey(secret);

    before(async () => {
        console.log("Checking Balance...");
        const mainWallet = provider.wallet.publicKey;
        const walletBalance = await program.provider.connection.getBalance(
            mainWallet
        );
        console.log(
            `${(walletBalance / anchor.web3.LAMPORTS_PER_SOL).toPrecision(
                3
            )} ( Main )`
        );

        if (walletBalance <= anchor.web3.LAMPORTS_PER_SOL * 5) {
            console.log(
                await airdrop(
                    program,
                    mainWallet,
                    2 * anchor.web3.LAMPORTS_PER_SOL
                )
            );
        }

        const transaction = new anchor.web3.Transaction();

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: mainWallet,
                newAccountPubkey: creatorWallet.publicKey,
                lamports: creatorStartingBalance,
                space: 0,
                programId: anchor.web3.SystemProgram.programId,
            })
        );

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: mainWallet,
                newAccountPubkey: contributorWallet.publicKey,
                lamports: contributorStartingBalance,
                space: 0,
                programId: anchor.web3.SystemProgram.programId,
            })
        );

        transaction.add(
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: mainWallet,
                newAccountPubkey: crankWallet.publicKey,
                lamports: crankStartingBalance,
                space: 0,
                programId: anchor.web3.SystemProgram.programId,
            })
        );

        await provider.sendAndConfirm(transaction, [
            creatorWallet,
            contributorWallet,
            crankWallet,
        ]);

        lastCreatorBalance = creatorStartingBalance;
        lastContributorBalance = contributorStartingBalance;
        lastCrankBalance = crankStartingBalance;

        console.log(
            `${(lastCreatorBalance / anchor.web3.LAMPORTS_PER_SOL).toPrecision(
                PRECISION_FACTOR
            )} ( Creator )`
        );
        console.log(
            `${(
                lastContributorBalance / anchor.web3.LAMPORTS_PER_SOL
            ).toPrecision(PRECISION_FACTOR)} ( Contributor )`
        );

        console.log(
            `${(lastCrankBalance / anchor.web3.LAMPORTS_PER_SOL).toPrecision(
                PRECISION_FACTOR
            )} ( Crank )`
        );
    });

    afterEach(async () => {
        {
            const newBalance =
                await creatorProgramProvider.provider.connection.getBalance(
                    creatorWallet.publicKey
                );

            const cost = lastCreatorBalance - newBalance;
            creatorBalanceTally += cost;
            lastCreatorBalance = newBalance;

            if (cost !== 0) {
                console.log(
                    "Cost ( Creator ): ",
                    (cost / anchor.web3.LAMPORTS_PER_SOL).toPrecision(
                        PRECISION_FACTOR
                    )
                );
            }
        }

        {
            const newBalance =
                await contributorProgramProvider.provider.connection.getBalance(
                    contributorWallet.publicKey
                );

            const cost = lastContributorBalance - newBalance;
            contributorBalanceTally += cost;
            lastContributorBalance = newBalance;

            if (cost !== 0) {
                console.log(
                    "Cost ( Contributor ): ",
                    (cost / anchor.web3.LAMPORTS_PER_SOL).toPrecision(
                        PRECISION_FACTOR
                    )
                );
            }
        }

        {
            const newBalance =
                await crankProgramProvider.provider.connection.getBalance(
                    crankWallet.publicKey
                );

            const cost = lastCrankBalance - newBalance;
            crankBalanceTally += cost;
            lastCrankBalance = newBalance;

            if (cost !== 0) {
                console.log(
                    "Cost ( Crank ): ",
                    (cost / anchor.web3.LAMPORTS_PER_SOL).toPrecision(
                        PRECISION_FACTOR
                    )
                );
            }
        }
    });

    after(() => {
        console.log(
            `Total Cost ( Creator ): ${(
                creatorBalanceTally / anchor.web3.LAMPORTS_PER_SOL
            ).toPrecision(PRECISION_FACTOR)}`
        );
        console.log(
            `Total Cost ( Contributor ): ${(
                contributorBalanceTally / anchor.web3.LAMPORTS_PER_SOL
            ).toPrecision(PRECISION_FACTOR)} = ${(
                (amountPerContribution * contributionCount) /
                anchor.web3.LAMPORTS_PER_SOL
            ).toPrecision(PRECISION_FACTOR)} + ${(
                (contributorBalanceTally -
                    amountPerContribution * contributionCount) /
                anchor.web3.LAMPORTS_PER_SOL
            ).toPrecision(PRECISION_FACTOR)}`
        );
        console.log(
            `Total Cost ( Crank ): ${(
                crankBalanceTally / anchor.web3.LAMPORTS_PER_SOL
            ).toPrecision(PRECISION_FACTOR)}`
        );

        console.log(
            "Media Mint: ",
            accountToSolscan(mediaMintAccount.publicKey)
        );
        console.log("User Mint: ", accountToSolscan(userMintAccount.publicKey));
    });

    it("Create User ( Creator )", async () => {
        try {
            await creatorProgramProvider.methods
                .createUser(userAccountBump, {
                    name: "h",
                    symbol: "h",
                    uri: "h",
                })
                .accounts({
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    owner: creatorWallet.publicKey,
                    collectionMint: userMintAccount.publicKey,
                    userAccount: userAccount,
                    userVault: userVault,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: METAPLEX_METADATA_ID,
                    collectionMetadata: userMetadataAccount,
                    collectionMasterEdition: userMetadataMasterEdition,
                })
                .signers([userMintAccount])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Edit User ( Creator )", async () => {
        try {
            await creatorProgramProvider.methods
                .editMetadata({
                    symbol: "TTT",
                    name: "TTT",
                    uri: "ttt.com",
                })
                .accounts({
                    owner: creatorWallet.publicKey,
                    userAccount: userAccount,
                    tokenMetadataProgram: METAPLEX_METADATA_ID,
                    metadata: userMetadataAccount,
                })
                .signers([])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Create Media ( Creator )", async () => {
        try {
            await creatorProgramProvider.methods
                .createMedia(createTestDistros(1), new BN(HALF_PERCENT), {
                    symbol: "",
                    name: "",
                    uri: "",
                })
                .accounts({
                    mediaAccount: mediaAccount,
                    mediaHashAccount: mediaHashAccount.publicKey,
                    mint: mediaMintAccount.publicKey,
                    userVault: userMediaVault,
                    metadata: mediaMetadataAccount,
                    masterEdition: mediaMetadataMasterEdition,
                    // -- Exsisting Accounts --
                    userAccount: userAccount,
                    collectionMasterEdition: userMetadataMasterEdition,
                    collectionMetadata: userMetadataAccount,
                    collectionMint: userMintAccount.publicKey,
                    // -- Programs --
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenMetadataProgram: METAPLEX_METADATA_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    // -- Signers --
                    owner: creatorWallet.publicKey,
                })
                .signers([mediaMintAccount, mediaHashAccount])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Print NFT From Creator ( Creator - Should Fail )", async () => {
        let failed = true;
        try {
            await creatorProgramProvider.methods
                .printSftFromCreator()
                .accounts({
                    originalUser: userAccount,
                    mediaAccount: mediaAccount,
                    sftMint: mediaMintAccount.publicKey,
                    // -- New Accounts --
                    ownerVault: creatorMediaVaultAccount,
                    // -- Programs --
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    // -- Signers --
                    owner: creatorWallet.publicKey,
                })
                .signers([])
                .rpc();
            failed = false;
        } catch (e) {}

        if (!failed) {
            throw new Error("Should not be Successful");
        }
    });

    it("Contribute To Media ( Contributor )", async () => {
        for (let i = 0; i < contributionCount; i++) {
            try {
                await contributorProgramProvider.methods
                    .contributeToMedia({
                        lamports: new anchor.BN(amountPerContribution),
                        toll: new BN(tollPerContribution),
                    })
                    .accounts({
                        mediaAccount: mediaAccount,
                        // -- New Accounts --
                        contributorAccount: contributorAccount,
                        // -- Programs --
                        systemProgram: anchor.web3.SystemProgram.programId,
                        // -- Signers --
                        contributor: contributorWallet.publicKey,
                    })
                    .signers([])
                    .rpc();
            } catch (e) {
                console.log(e);
                throw new Error("Did not work");
            }
            console.log(
                `Contirbution #${i + 1}: ${
                    amountPerContribution / anchor.web3.LAMPORTS_PER_SOL
                }`
            );
            await sleep(1000);
        }
    });

    it("Distribute Crank - Contribute ( Crank )", async () => {
        const mediaAccountData =
            await crankProgramProvider.account.mediaAccount.fetch(mediaAccount);

        let i = 1;
        for (const distro of mediaAccountData.workerDistributions as any[]) {
            const wallet = distro.wallet as anchor.web3.PublicKey;

            try {
                await crankProgramProvider.methods
                    .distributeToWorkersCrank()
                    .accounts({
                        mediaAccount: mediaAccount,
                        recipient: wallet,
                    })
                    .rpc();
            } catch (e) {
                console.log(e);
                throw new Error("Did not work");
            }
            console.log(`Crank #${i++}`);
        }

        console.log(
            await mediaAccountToString(crankProgramProvider, mediaAccount)
        );
    });

    it("Distribute Crank - QR Code ( Crank )", async () => {
        {
            // Transfer to Media Account
            const tx = new anchor.web3.Transaction().add(
                anchor.web3.SystemProgram.transfer({
                    fromPubkey: provider.wallet.publicKey,
                    toPubkey: mediaAccount,
                    lamports: QRDonation,
                })
            );

            await provider.sendAndConfirm(tx);
        }

        const mediaAccountData =
            await crankProgramProvider.account.mediaAccount.fetch(mediaAccount);

        let i = 1;
        for (const distro of mediaAccountData.workerDistributions as any[]) {
            const wallet = distro.wallet as anchor.web3.PublicKey;

            try {
                await crankProgramProvider.methods
                    .distributeToWorkersCrank()
                    .accounts({
                        mediaAccount: mediaAccount,
                        recipient: wallet,
                    })
                    .rpc();
            } catch (e) {
                console.log(e);
                throw new Error("Did not work");
            }
            console.log(`Crank #${i++}`);
        }

        console.log(
            await mediaAccountToString(crankProgramProvider, mediaAccount)
        );
    });

    it("Print NFT from Creator ( Creator )", async () => {
        try {
            await creatorProgramProvider.methods
                .printSftFromCreator()
                .accounts({
                    originalUser: userAccount,
                    mediaAccount: mediaAccount,
                    sftMint: mediaMintAccount.publicKey,
                    // -- New Accounts --
                    ownerVault: creatorMediaVaultAccount,
                    // -- Programs --
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    // -- Signers --
                    owner: creatorWallet.publicKey,
                })
                .signers([])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Print NFT from Owner #2 ( Should Fail )", async () => {
        let failed = true;
        try {
            await creatorProgramProvider.methods
                .printSftFromCreator()
                .accounts({
                    originalUser: userAccount,
                    mediaAccount: mediaAccount,
                    sftMint: mediaMintAccount.publicKey,
                    // -- New Accounts --
                    ownerVault: creatorMediaVaultAccount,
                    // -- Programs --
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    // -- Signers --
                    owner: creatorWallet.publicKey,
                })
                .signers([])
                .rpc();

            failed = false;
        } catch (e) {}

        if (!failed) {
            throw new Error("Should not be Successful");
        }
    });

    it("Print NFT from Contributor", async () => {
        try {
            await contributorProgramProvider.methods
                .printSftFromContributor()
                .accounts({
                    originalUser: userAccount,
                    mediaAccount: mediaAccount,
                    sftMint: mediaMintAccount.publicKey,
                    contributorAccount: contributorAccount,
                    // -- New Accounts --
                    contributorVault: contributorMediaVaultAccount,
                    // -- Programs --
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    // -- Signers --
                    contributor: contributorWallet.publicKey,
                })
                .signers([])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Print NFT from Contributor #2 ( Should Fail )", async () => {
        let failed = true;
        try {
            await contributorProgramProvider.methods
                .printSftFromContributor()
                .accounts({
                    originalUser: userAccount,
                    mediaAccount: mediaAccount,
                    sftMint: mediaMintAccount.publicKey,
                    contributorAccount: contributorAccount,
                    // -- New Accounts --
                    contributorVault: contributorMediaVaultAccount,
                    // -- Programs --
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    // -- Signers --
                    contributor: contributorWallet.publicKey,
                })
                .signers([])
                .rpc();
            failed = false;
        } catch (e) {}

        if (!failed) {
            throw new Error("Should not be Successful");
        }
    });

    it("Edit Media", async () => {
        try {
            await creatorProgramProvider.methods
                .editMetadata({
                    symbol: "MMM",
                    name: "MMM",
                    uri: "mmm.com",
                })
                .accounts({
                    owner: creatorWallet.publicKey,
                    userAccount: userAccount,
                    tokenMetadataProgram: METAPLEX_METADATA_ID,
                    metadata: mediaMetadataAccount,
                })
                .signers([])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Collect Media Tolls", async () => {
        try {
            await crankProgramProvider.methods
                .distributeToCommunityFromMediaCrank()
                .accounts({
                    mediaAccount: mediaAccount,
                    communityWallet: communityWallet.publicKey,
                })
                .signers([])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Collect User Lamports", async () => {
        try {
            await crankProgramProvider.methods
                .distributeToUserCrank()
                .accounts({
                    userAccount: userAccount,
                    owner: creatorWallet.publicKey,
                })
                .signers([])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Check Media Values", async () => {
        const accountData =
            await crankProgramProvider.account.mediaAccount.fetch(mediaAccount);

        expect(
            accountData.tollTotal.eq(
                new BN(tollPerContribution * contributionCount)
            ),
            "Checking that toll total is correct"
        ).equal(true);

        expect(
            accountData.tollToDistribute.eq(new BN(0)),
            "Checking that all tolls are distributed"
        ).equal(true);

        console.log(
            await mediaAccountToString(crankProgramProvider, mediaAccount)
        );
    });

    it("Create User ( Contibuter )", async () => {
        try {
            await contributorProgramProvider.methods
                .createUser(contributorUserAccountBump, {
                    name: "c",
                    symbol: "c",
                    uri: "c",
                })
                .accounts({
                    systemProgram: anchor.web3.SystemProgram.programId,
                    tokenProgram: SPL.TOKEN_PROGRAM_ID,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    owner: contributorWallet.publicKey,
                    collectionMint: contributorUserMintAccount.publicKey,
                    userAccount: contributorUserAccount,
                    userVault: contributorUserVault,
                    associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: METAPLEX_METADATA_ID,
                    collectionMetadata: contributorUserMetadataAccount,
                    collectionMasterEdition:
                        contributorUserMetadataMasterEdition,
                })
                .signers([contributorUserMintAccount])
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Create Affiliate ( Contibuter )", async () => {
        let accounts = "\n";

        accounts += `originalMediaAccount: ${mediaAccount.toString()}\n`;
        accounts += `userAccount: ${contributorUserAccount.toString()}\n`;
        accounts += `affiliateMediaAccount: ${affiliateMediaAccount.toString()}\n`;
        accounts += `systemProgram: ${anchor.web3.SystemProgram.programId.toString()}\n`;
        accounts += `rent: ${anchor.web3.SYSVAR_RENT_PUBKEY.toString()}\n`;
        accounts += `owner: ${contributorWallet.publicKey.toString()}\n\n`;

        console.log(accounts);

        try {
            await contributorProgramProvider.methods
                .createAffiliate()
                .accounts({
                    originalMediaAccount: mediaAccount,
                    userAccount: contributorUserAccount,
                    // -- Exsisting Accounts --
                    affiliateMediaAccount: affiliateMediaAccount,
                    // -- Programs --
                    systemProgram: anchor.web3.SystemProgram.programId,
                    // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    // -- Signers --
                    owner: contributorWallet.publicKey,
                })
                .rpc();
        } catch (e) {
            console.log(e);
            throw new Error("Did not work");
        }
    });

    it("Check Contrabution Amount", async () => {
        const contributorAccountData =
            await contributorProgramProvider.account.contributorAccount.fetch(
                contributorAccount
            );

        expect(
            contributorAccountData.lamportsTotal.eq(
                new BN(contributionCount * amountPerContribution)
            ),
            "Checking that amount contributed matches"
        ).equal(true);
        expect(
            contributorAccountData.contributor.equals(
                contributorWallet.publicKey
            ),
            "Checking contributer account matches"
        ).equal(true);
        expect(
            contributorAccountData.originalMediaOrUserAccount.equals(
                mediaAccount
            ),
            "Checking mediaOrUserAccount account matches"
        ).equal(true);
    });
});

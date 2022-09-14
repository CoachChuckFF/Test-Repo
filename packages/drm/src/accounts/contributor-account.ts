import { web3, BN } from "@project-serum/anchor";
import { ACCOUNT_FETCH_STATE } from "../models/fetch-response";
import { CONTRIBUTOR_HASH } from "../models/globals";
import { EXCALIBUR_DRM_ID } from "../models/program-ids";
import { DRMProgram } from "./program";

export interface ContributorAccount {
    key: web3.PublicKey;
    creationDate: BN;
    lastContributed: BN;
    lamportsTotal: BN;
    contributor: web3.PublicKey;
    originalMediaOrUserAccount: web3.PublicKey;
}

export interface ContributorAccountFetchResponse {
    state: ACCOUNT_FETCH_STATE;
    account: ContributorAccount | undefined;
}

/**
 * Fetches the Contributor key from the contribution wallet and the media or user account key
 *
 * @param contributor
 * @param originalMediaOrUserAccount
 * @returns PublicKey
 */
export function getContributorKey(
    contributor: web3.PublicKey,
    originalMediaOrUserAccount: web3.PublicKey
) {
    return web3.PublicKey.findProgramAddress(
        [
            Buffer.from(CONTRIBUTOR_HASH),
            contributor.toBuffer(),
            originalMediaOrUserAccount.toBuffer(),
        ],
        EXCALIBUR_DRM_ID
    );
}

export async function fetchContributorAccount(
    program: DRMProgram,
    account: web3.PublicKey
) {
    return _fetchContributorAccount(program, { account });
}

export async function fetchContributorAccountFromMediaOrUser(
    program: DRMProgram,
    contributor: web3.PublicKey,
    mediaOrUser: web3.PublicKey
) {
    return _fetchContributorAccount(program, { contributor, mediaOrUser });
}

export async function fetchContributorAccountFromProgram(
    program: DRMProgram,
    mediaOrUser: web3.PublicKey
) {
    return _fetchContributorAccount(program, {
        contributor: program.program.provider.publicKey as web3.PublicKey,
        mediaOrUser,
    });
}

async function _fetchContributorAccount(
    program: DRMProgram,
    key: {
        account?: web3.PublicKey;
        contributor?: web3.PublicKey;
        mediaOrUser?: web3.PublicKey;
    }
) {
    let state = ACCOUNT_FETCH_STATE.NOT_LOADED;
    let account = undefined;

    const fetchKey =
        key.account ??
        (
            await getContributorKey(
                key.contributor ?? web3.PublicKey.default,
                key.mediaOrUser ?? web3.PublicKey.default
            )
        )[0];

    try {
        const fetchData =
            await program.program.account.contributorAccount.fetch(fetchKey);

        account = {
            key: fetchKey,
            creationDate: fetchData.creationDate,
            lastContributed: fetchData.lastContributed,
            lamportsTotal: fetchData.lamportsTotal,
            contributor: fetchData.contributor,
            originalMediaOrUserAccount: fetchData.originalMediaOrUserAccount,
        } as ContributorAccount;

        state = ACCOUNT_FETCH_STATE.LOADED;
    } catch (e) {
        state = ACCOUNT_FETCH_STATE.DNE;
    }

    return {
        state,
        account,
    } as ContributorAccountFetchResponse;
}

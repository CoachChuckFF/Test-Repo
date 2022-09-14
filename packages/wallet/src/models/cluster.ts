import { clusterApiUrl, ConfirmOptions, Connection } from "@solana/web3.js";
import { TokenListProvider, TokenInfo, ENV } from "@solana/spl-token-registry";

export type ClusterName =
    | "mainnet-beta"
    | "devnet"
    | "testnet"
    | "localnet"
    | "custom";
export type Commitment = "processed" | "confirmed" | "max";

//TODO Make these env variables
export const MAINNET_URL =
    "https://shy-snowy-sun.solana-mainnet.quiknode.pro/153bd28c5eb2d9018f23885a9db0f47cb9ca9b40/";
export const DEVNET_URL =
    "https://purple-bitter-fog.solana-devnet.quiknode.pro/bbaef213e07e6a854c2340148629b2812d9097a7/";
export const TESTNET_URL = clusterApiUrl("testnet");
export const LOCALNET_URL = "http://localhost:8899";

export const DEFAULT_URL = MAINNET_URL;
export const DEFAULT_COMMITMENT = "max" as Commitment;
export const DEFAULT_TIMEOUT = 120 * 1000;

export interface CommitmentConfig {
    commitment?: Commitment;
    confirmTransactionInitialTimeout?: number;
}

export const DEFAULT_CONNECTION_CONFIG = {
    commitment: DEFAULT_COMMITMENT,
    confirmTransactionInitialTimeout: DEFAULT_TIMEOUT,
} as CommitmentConfig;

export interface Cluster {
    name: ClusterName;
    apiUrl: string;
    label: string;
    connection: Connection;
    opts: CommitmentConfig;
    chainID: number;
}

export const CLUSTERS: Cluster[] = [
    {
        name: "mainnet-beta",
        apiUrl: MAINNET_URL,
        label: "Mainnet",
        connection: new Connection(MAINNET_URL, DEFAULT_CONNECTION_CONFIG),
        opts: DEFAULT_CONNECTION_CONFIG,
        chainID: ENV.MainnetBeta,
    },
    {
        name: "devnet",
        apiUrl: DEVNET_URL,
        label: "Devnet",
        connection: new Connection(DEVNET_URL, DEFAULT_CONNECTION_CONFIG),
        opts: DEFAULT_CONNECTION_CONFIG,
        chainID: ENV.Devnet,
    },
    {
        name: "testnet",
        apiUrl: TESTNET_URL,
        label: "Testnet",
        connection: new Connection(TESTNET_URL, DEFAULT_CONNECTION_CONFIG),
        opts: DEFAULT_CONNECTION_CONFIG,
        chainID: ENV.Testnet,
    },
    {
        name: "localnet",
        apiUrl: LOCALNET_URL,
        label: "Localnet",
        connection: new Connection(LOCALNET_URL, DEFAULT_CONNECTION_CONFIG),
        opts: DEFAULT_CONNECTION_CONFIG,
        chainID: ENV.MainnetBeta,
    },
    {
        name: "custom",
        apiUrl: LOCALNET_URL,
        label: "Customnet",
        connection: new Connection(MAINNET_URL, DEFAULT_CONNECTION_CONFIG),
        opts: DEFAULT_CONNECTION_CONFIG,
        chainID: ENV.MainnetBeta,
    },
];

//TODO Change back to Mainnet
export const DEFAULT_CLUSTER = CLUSTERS[1];
export const DEFAULT_CONNECTION = DEFAULT_CLUSTER.connection;

export function getCluster(name: ClusterName): Cluster {
    return CLUSTERS.find((c) => c.name === name) ?? DEFAULT_CLUSTER;
}

export function getConnectionFromCluster(name: ClusterName): Connection {
    return getCluster(name).connection;
}

export interface ConnectionOptions {
    url?: string;
    config?: CommitmentConfig;
}
export interface ClusterOptions {
    cluster?: Cluster;
    clusterName?: ClusterName;
    connection?: Connection;
    connectionConfig?: ConnectionOptions;
    url?: string;
}
export function getClusterFromOptions(option?: ClusterOptions): Cluster {
    if (option) {
        if (option.cluster) return option.cluster;
        if (option.clusterName) return getCluster(option.clusterName);
        if (option.connection)
            return {
                ...getCluster("custom"),
                connection: option.connection,
            };
        if (option.connectionConfig)
            return {
                ...getCluster("custom"),
                connection: new Connection(
                    option.connectionConfig.url ?? DEFAULT_URL,
                    option.connectionConfig.config ?? DEFAULT_CONNECTION_CONFIG
                ),
            };
        if (option.url)
            return {
                ...getCluster("custom"),
                connection: new Connection(
                    option.url,
                    DEFAULT_CONNECTION_CONFIG
                ),
            };
    }

    return DEFAULT_CLUSTER;
}

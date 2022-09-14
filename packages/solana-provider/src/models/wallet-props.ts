import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConfirmOptions } from "@solana/web3.js";

export interface SolanaWalletProviderProps {
    network: WalletAdapterNetwork;
    rpc: string;
    confirmOptions?: ConfirmOptions;
    children?: React.ReactNode;
}

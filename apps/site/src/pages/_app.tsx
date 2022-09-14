import "@styles/globals.css";
import React from "react";
import type { AppProps } from "next/app";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SolanaWalletProvider } from "@excalibur/solana-provider";
import ModalContainer from "react-modal-promise";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import Toast from "@components/Toast";
config.autoAddCss = false;

//TODO Providers should probably go here
function MyApp({ Component, pageProps }: AppProps) {
    process.env.NEXT_PUBLIC_ANALYTICS_ID;
    //TODO set these an env var
    const network = process.env
        .NEXT_PUBLIC_SOLANA_NETWORK as WalletAdapterNetwork;
    const rpc = process.env.NEXT_PUBLIC_SOLANA_RPC;
    const confirmOptions = {};

    return (
        <SolanaWalletProvider
            network={network}
            rpc={rpc}
            confirmOptions={confirmOptions}
        >
            <ModalContainer />
            <Toast />
            <Component {...pageProps} />
        </SolanaWalletProvider>
    );
}

export default MyApp;

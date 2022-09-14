import React, { useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ExcaliburWallet, ExcaliburWalletAdapter } from "@excalibur/wallet";
import {
    ExcaliburWalletModalProvider,
    ExcaliburWalletModalProviderContext,
} from "./ExcaliburWalletModalProvider";
import { SolanaWalletProviderProps } from "../models/wallet-props";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export function SolanaWalletProvider(props: SolanaWalletProviderProps) {
    const { network, rpc, children, confirmOptions } = props;

    return (
        <ExcaliburWalletModalProvider
            network={network}
            rpc={rpc}
            confirmOptions={confirmOptions}
        >
            <_SolanaWalletProviderInternal network={network} rpc={rpc}>
                {children}
            </_SolanaWalletProviderInternal>
        </ExcaliburWalletModalProvider>
    );
}

function _SolanaWalletProviderInternal(props: SolanaWalletProviderProps) {
    const { network, rpc, children } = props;

    const endpoint = useMemo(() => rpc, [network]);

    const showExcaliburModal = React.useContext(
        ExcaliburWalletModalProviderContext
    );

    const onAdapterConnect = () => {
        return new Promise<ExcaliburWallet | null>((resolve) => {
            console.log("Getting Wallet");
            showExcaliburModal()
                .then((wallet) => {
                    console.log("Got Wallet");
                    resolve(wallet);
                })
                .catch((e) => {
                    console.log(e);
                    console.log("Error getting Wallet");
                    resolve(null);
                });
        });
    };

    const wallets = useMemo(
        () => [
            new ExcaliburWalletAdapter(onAdapterConnect),
            // new ExcaliburExtensionWalletAdapter(),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={false}>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

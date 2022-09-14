import React, { useState } from "react";
import { ExcaliburWallet } from "@excalibur/wallet";
import ModalContainer, { create } from "react-modal-promise";
import { LoginPage } from "@excalibur/wallet-ui";
import { Connection } from "@solana/web3.js";
import { SolanaWalletProviderProps } from "../models/wallet-props";

export const ExcaliburWalletModalProviderContext = React.createContext<
    () => Promise<ExcaliburWallet | null>
>(null as any);

interface LoginModalProps {
    isOpen: boolean;
    onResolve: (wallet: ExcaliburWallet | null) => void;
    onReject: () => void;
}

function _ExcaliburWalletModalProviderInternal(
    props: SolanaWalletProviderProps
) {
    const { rpc, children, confirmOptions } = props;

    const LoginModal = ({ isOpen, onResolve, onReject }: LoginModalProps) => {
        return (
            <>
                <div
                    className="absolute inset-0 w-screen overflow-hidden h-screen m-auto z-[101] flex flex-col bg-clrDarkBlue/80 backdrop-filter backdrop-blur-sm"
                    id="LOGIN-MODAL"
                >
                    <div className="flex h-screen justify-center items-center ">
                        <LoginPage
                            onCancel={onReject}
                            onWallet={onResolve}
                            confirmOptions={confirmOptions}
                            connection={new Connection(rpc, confirmOptions)}
                        />
                    </div>
                </div>
            </>
        );
    };

    const LoginPromise = create(LoginModal);

    const connectWallet = () => {
        return new Promise<ExcaliburWallet | null>((resolve) => {
            LoginPromise()
                .then((wallet) => {
                    resolve(wallet);
                })
                .catch((e) => {
                    resolve(null);
                });
        });
    };

    return (
        <>
            <ExcaliburWalletModalProviderContext.Provider value={connectWallet}>
                {children}
            </ExcaliburWalletModalProviderContext.Provider>
        </>
    );
}

export function ExcaliburWalletModalProvider(props: SolanaWalletProviderProps) {
    const { network, rpc, children, confirmOptions } = props;

    return (
        <>
            <_ExcaliburWalletModalProviderInternal
                network={network}
                rpc={rpc}
                confirmOptions={confirmOptions}
            >
                {children}
            </_ExcaliburWalletModalProviderInternal>
        </>
    );
}

export default ExcaliburWalletModalProvider;

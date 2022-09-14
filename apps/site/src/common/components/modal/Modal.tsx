import { FC } from "react";
import Backdrop from "../backdrop/Backdrop";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConfirmOptions } from "@solana/web3.js";

export interface ModalProps {
    isOpen: boolean;
    children?: React.ReactNode;
}

/**
 * TODO - Make more generic
 *
 *
 * @param props The Props for the Modal Page
 * @returns
 */
export function Modal(props: ModalProps) {
    const { isOpen, children } = props;

    if (!isOpen) return null;

    return (
        <div className="modalContainer flex flex-col items-center justify-center  z-50 h-screen w-screen fixed top-0 left-0 overflow-hidden ">
            {children}
        </div>
    );
}

export default Modal;

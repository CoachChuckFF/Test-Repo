import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletNotConnectedError,
    WalletReadyState,
    WalletSignMessageError,
} from "@solana/wallet-adapter-base";
import { PublicKey, Transaction } from "@solana/web3.js";
import { ExcaliburWallet } from "../controllers/wallet";

export abstract class BaseExcaliburWalletAdapter extends BaseMessageSignerWalletAdapter {
    protected _wallet: ExcaliburWallet | null;
    protected _readyState: WalletReadyState = WalletReadyState.Installed;
    protected _connecting: boolean;

    protected _connectWalletCallback: () => Promise<ExcaliburWallet | null>;

    constructor(connectWalletCallback: () => Promise<ExcaliburWallet | null>) {
        super();

        this._connectWalletCallback = connectWalletCallback;
        this._connecting = false;
        this._wallet = null;

        scopePollingDetectionStrategy(() => {
            this._readyState = WalletReadyState.Installed;
            this.emit("readyStateChange", this._readyState);
            return true;
        });
    }

    get publicKey(): PublicKey | null {
        return this._wallet?.publicKey || null;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return this._wallet !== null;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        if (this._connecting || this.connected) return;

        this._connecting = true;

        return this._connectWalletCallback()
            .then((wallet) => {
                this._wallet = wallet;

                if (wallet) {
                    this.emit("connect", wallet.publicKey);
                } else {
                    this.emit("disconnect");
                }
            })
            .finally(() => {
                this._connecting = false;
            });
    }

    async disconnect(): Promise<void> {
        this._wallet = null;
        this.emit("disconnect");
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            if (this._wallet) {
                return (
                    (await this._wallet.signTransaction(transaction)) ||
                    transaction
                );
            } else {
                throw new WalletNotConnectedError();
            }
        } catch (error: any) {
            this.emit("error", error);
            throw error;
        }
    }

    async signAllTransactions(
        transactions: Transaction[]
    ): Promise<Transaction[]> {
        try {
            if (this._wallet) {
                return (
                    (await this._wallet.signAllTransactions(transactions)) ||
                    transactions
                );
            } else {
                throw new WalletNotConnectedError();
            }
        } catch (error: any) {
            this.emit("error", error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            if (this._wallet) {
                try {
                    return this._wallet.createRawSignature(message);
                } catch (error: any) {
                    throw new WalletSignMessageError(error?.message, error);
                }
            } else {
                throw new WalletNotConnectedError();
            }
        } catch (error: any) {
            this.emit("error", error);
            throw error;
        }
    }
}

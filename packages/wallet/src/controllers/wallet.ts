import {
    Keypair,
    Transaction,
    Connection,
    ConfirmOptions,
} from "@solana/web3.js";
import * as crypto from "crypto-js";
import { AnchorProvider } from "@project-serum/anchor";
import bs58 from "bs58";
import nacl from "tweetnacl";
import { generateDiffieHellman } from "./diffieHellman";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { getRandomFile } from "./utils";

export class ExcaliburWallet {
    _keypair: Keypair;
    _confirmOptions: ConfirmOptions;
    _provider: AnchorProvider;

    constructor(
        keypair: Keypair,
        connection: Connection,
        confirmOptions?: ConfirmOptions
    ) {
        this._confirmOptions = confirmOptions ?? {};

        this._keypair = keypair;

        this._provider = new AnchorProvider(
            connection,
            new NodeWallet(this._keypair),
            this._confirmOptions
        );
    }

    // --------- GETTERS ----------------

    get provider() {
        return this._provider;
    }

    get publicKey() {
        return this.provider.publicKey;
    }

    get connection() {
        return this.provider.connection;
    }

    get confirmOptions() {
        return this._confirmOptions;
    }

    // --------- SETTERS ----------------
    set connection(connection: Connection) {
        this._provider = new AnchorProvider(
            connection,
            new NodeWallet(this._keypair),
            this.confirmOptions
        );
    }

    set confirmOptions(confirmOptions: ConfirmOptions) {
        this._confirmOptions = confirmOptions;
        this._provider = new AnchorProvider(
            this.connection,
            new NodeWallet(this._keypair),
            confirmOptions
        );
    }

    // --------------- WALLET FUNCTIONS ------------------

    signTransaction = async (tx: Transaction) => {
        return this.provider.wallet.signTransaction(tx);
    };

    signAllTransactions = (txs: Transaction[]) => {
        return this.provider.wallet.signAllTransactions(txs);
    };

    createRawSignature = (message: Uint8Array) => {
        return nacl.sign.detached(message, this._keypair.secretKey);
    };

    createSignature = (message: Uint8Array) => {
        return bs58.encode(this.createRawSignature(message));
    };

    createDiffieHellman = () => {
        return generateDiffieHellman(this.publicKey, this._keypair.secretKey);
    };

    // --------------- STATIC CONSTRUCTORS ------------------
    static fromFile(
        file: File,
        connection: Connection,
        confirmOptions?: ConfirmOptions,
        password?: string
    ): Promise<ExcaliburWallet> {
        return new Promise<ExcaliburWallet>((resolve, reject) => {
            this.getKeypairFromFile(file, password)
                .then((keypair) => {
                    resolve(
                        new ExcaliburWallet(keypair, connection, confirmOptions)
                    );
                })
                .catch((e) => {
                    reject(e);
                });
        });
    }

    static createBurner(
        connection: Connection,
        confirmOptions?: ConfirmOptions
    ) {
        return ExcaliburWallet.fromFile(
            getRandomFile(),
            connection,
            confirmOptions
        );
    }

    // --------------- STATIC HELPERS ------------------
    // File -> Byte Buffer -> base64 -> seed -> Keypair

    static getKeypairFromFile(file: File, password?: string): Promise<Keypair> {
        return new Promise<Keypair>((resolve, reject) => {
            this._getSeedFromFile(file, password)
                .then((seed) => {
                    resolve(this._getKeypairFromSeed(seed));
                })
                .catch((e) => {
                    reject(e);
                });
        });
    }

    static _getSeedFromFile(file: File, password?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            file.arrayBuffer()
                .then((array) => {
                    resolve(
                        ExcaliburWallet._getSeedFromByteBuffer(array, password)
                    );
                })
                .catch((e) => {
                    reject(e);
                });
        });
    }

    static _getSeedFromByteBuffer(
        arrayBuffer: ArrayBuffer,
        password?: string
    ): string {
        return ExcaliburWallet._getSeedfromBase64(
            ExcaliburWallet._getBase64FromArrayBuffer(arrayBuffer),
            password
        );
    }

    static _getSeedfromBase64(bytesBase64: string, password?: string): string {
        const base64 = password ? password + ":" + bytesBase64 : bytesBase64;
        return crypto.SHA256(base64).toString(crypto.enc.Base64);
    }

    static _getKeypairFromSeed(seed: string): Keypair {
        const array = new Uint8Array(
            atob(seed)
                .split("")
                .map((char) => char.charCodeAt(0))
        );
        return Keypair.fromSeed(array);
    }

    static _getBase64FromArrayBuffer(arrayBuffer: ArrayBuffer): string {
        return btoa(
            new Uint8Array(arrayBuffer).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
            )
        );
    }
}

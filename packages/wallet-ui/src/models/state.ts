// import { ExcaliburWallet, SPLAccount } from "../../../wallet/src/controllers/wallet";

// export enum State {
//     NOT_CONNECTED = "Not Connected",
//     MAIN = "Main",
//     POPUP = "Popup",
//     HIDDEN = "Hidden",
// }

// export enum SideMenuState {
//     OPEN = "Open",
//     CLOSED = "Closed",
// }
// export enum PageControl {
//     LOGGED_OUT = "Logged out",
//     LOGGED_IN = "Logged in",
//     TRANSFERS = "Transfers",
//     NFT = "NFT",
//     DEPOSIT = "Deposits",
// }
// export type WalletFunction =
//     | "Logged out"
//     | "Logged in"
//     | "Balance"
//     | "Transfer"
//     | "NFT";

// // export enum TOKEN_NAME {
// //     TOKEN_NAME = " ",
// // }
// // export enum TOKEN_SYMBOL {}
// // export enum TOKEN_THUMB {}

// export const STORAGE_KEYS = {
//     image: "EXCAL_IMAGE", // base64
//     last_signed_in: "EXCAL_LAST_SIGNED_IN", // UNIX timestamp
// };
// // export const TOKEN_NAME: TOKEN_NAME = TOKEN_NAME.TOKEN_NAME;
// // export const TOKEN_SYMBOL: TOKEN_SYMBOL = TOKEN_SYMBOL.TOKEN_SYMBOL;
// // export const TOKEN_THUMB: TOKEN_DETAILS = TOKEN_DETAILS.TOKEN_THUMB;
// export const STARTING_STATE: State = State.HIDDEN;
// export const STARTING_WALLET_STATE: PageControl = PageControl.LOGGED_IN;
// export const STARTING_SIDE_MENU_STATE: SideMenuState = SideMenuState.CLOSED;
// export const STARTING_IS_LOADING: boolean = false;
// export const STARTING_ON_ADAPTER_CONNECT = undefined as any;
// export const STARTING_LOADING_MESSAGE: string = "Beep Boop";
// export const STARTING_WALLET: ExcaliburWallet | undefined = undefined;
// export const STARTING_CURRENT_TOKEN: SPLAccount | undefined = undefined;
//Base 64
export const DEFAULT_IMG: string =
    "data:image/image/png;base64,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";

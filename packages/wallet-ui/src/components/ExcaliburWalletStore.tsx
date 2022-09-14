export const TEST_123 = "";

// import React, { useEffect } from "react";
// import {
//     State,
//     PageControl,
//     SideMenuState,
//     STARTING_STATE,
//     STARTING_WALLET,
//     STARTING_IS_LOADING,
//     STARTING_LOADING_MESSAGE,
//     STARTING_WALLET_STATE,
//     STARTING_SIDE_MENU_STATE,
//     STARTING_CURRENT_TOKEN,
// } from "../models/state";
// import {
//     clearLocalStorage,
//     isExtension,
//     isExtensionPopup,
//     getExcalProviderFromLocalStorage,
// } from "../controllers/utils";
// import { ExcaliburWallet, SPLAccount } from "../controllers/wallet";
// import { web3 } from "@project-serum/anchor";

// export interface ExcaliburWalletStore {
//     isLoading: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
//     loadingMessage: [string, React.Dispatch<React.SetStateAction<string>>];
//     state: [State, React.Dispatch<React.SetStateAction<State>>];
//     walletState: [
//         PageControl,
//         React.Dispatch<React.SetStateAction<PageControl>>
//     ];
//     currentToken: [
//         SPLAccount | undefined,
//         React.Dispatch<React.SetStateAction<SPLAccount | undefined>>
//     ];
//     sideMenu: [
//         SideMenuState,
//         React.Dispatch<React.SetStateAction<SideMenuState>>
//     ];
//     wallet: [
//         ExcaliburWallet | undefined,
//         React.Dispatch<React.SetStateAction<ExcaliburWallet | undefined>>
//     ];
//     isExtension: [boolean];
//     isExtensionPopup: [boolean];
//     logout: [() => void];
// }

// export const logoutOfStore = (store: ExcaliburWalletStore) => {
//     clearLocalStorage().finally(() => {
//         if (store.isLoading[1] !== null)
//             store.isLoading[1](STARTING_IS_LOADING);
//         if (store.state[1] !== null) store.state[1](STARTING_STATE);
//         if (store.wallet[1] !== null) store.wallet[1](STARTING_WALLET);
//     });
// };

// export const NULL_STORE: ExcaliburWalletStore = {
//     isLoading: [STARTING_IS_LOADING, null as any],
//     loadingMessage: [STARTING_LOADING_MESSAGE, null as any],
//     state: [STARTING_STATE, null as any],
//     currentToken: [STARTING_CURRENT_TOKEN, null as any],
//     walletState: [STARTING_WALLET_STATE, null as any],
//     sideMenu: [STARTING_SIDE_MENU_STATE, null as any],
//     wallet: [STARTING_WALLET, null as any],
//     isExtension: [isExtension],
//     isExtensionPopup: [isExtensionPopup],
//     logout: [null as any],
// };

// export const ExcaliburWalletStoreContext =
//     React.createContext<ExcaliburWalletStore>(NULL_STORE);

// export default function StoreProvider({ children }: any) {
//     // Is Loading
//     const [isLoading, setIsLoading] = React.useState(STARTING_IS_LOADING);

//     // Is Loading
//     const [loadingMessage, setIsLoadingMessage] = React.useState(
//         STARTING_LOADING_MESSAGE
//     );

//     // const [currentMedia, setCurrentMedia] = React.useState<web3.PublicKey>()

//     // State
//     const [state, setState] = React.useState(STARTING_STATE);

//     //TOKEN DETAILS
//     const [currentToken, setCurrentToken] = React.useState(
//         STARTING_CURRENT_TOKEN
//     );

//     // PAGE CONTROLLER
//     const [sideMenu, setSideMenu] = React.useState(STARTING_SIDE_MENU_STATE);
//     const [walletState, setWalletState] = React.useState(STARTING_WALLET_STATE);

//     // Wallet
//     const [wallet, setWallet] = React.useState<ExcaliburWallet | undefined>(
//         STARTING_WALLET
//     );

//     // On Page Load - Try to initalize page
//     useEffect(() => {
//         if (isExtension) {
//             setIsLoading(true);

//             getExcalProviderFromLocalStorage()
//                 .then((provider) => {
//                     setWallet(provider);
//                     if (isExtensionPopup) {
//                         setState(State.POPUP);
//                     } else {
//                         setState(State.MAIN);
//                     }
//                 })
//                 .finally(() => {
//                     setIsLoading(false);
//                 });
//         }
//     }, []);

//     const store: ExcaliburWalletStore = {
//         isLoading: [isLoading, setIsLoading],
//         loadingMessage: [loadingMessage, setIsLoadingMessage],
//         state: [state, setState],
//         wallet: [wallet, setWallet],
//         currentToken: [currentToken, setCurrentToken],
//         isExtension: [isExtension],
//         isExtensionPopup: [isExtensionPopup],
//         walletState: [walletState, setWalletState],
//         sideMenu: [sideMenu, setSideMenu],

//         logout: [
//             () => {
//                 setIsLoading(true);
//                 logoutOfStore(store);
//             },
//         ],
//     };

//     return (
//         <ExcaliburWalletStoreContext.Provider value={store}>
//             {children}
//         </ExcaliburWalletStoreContext.Provider>
//     );
// }

import { ConnectButton } from "@excalibur/solana-provider";
import type { NextPage } from "next";

const WalletPage: NextPage = () => {
    //This is how routing works in Next.js
    return (
        <>
            <h1>Hello Wallet Page</h1>
            <ConnectButton />
        </>
    );
};

export default WalletPage;

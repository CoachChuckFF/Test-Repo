import type { NextPage } from "next";
import { ExcaliburWallet } from "@excalibur/wallet";
import { Connection } from "@solana/web3.js";

const TestPage: NextPage = () => {
    const handleChange = (selectorFiles: FileList) => {
        const file = selectorFiles[0];
        const temp = new File([file], "Test");
        const wallet = ExcaliburWallet.fromFile(
            file,
            new Connection("https://api.devnet.solana.com", {})
        );
        const walletB = ExcaliburWallet.createBurner(
            new Connection("https://api.devnet.solana.com", {})
        );
    };

    return (
        <>
            Hello Test Page
            <input
                type="file"
                onChange={(e) => handleChange(e.target.files)}
            ></input>
        </>
    );
};

export default TestPage;

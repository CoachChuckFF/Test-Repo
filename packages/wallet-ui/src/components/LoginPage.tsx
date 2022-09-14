import React, { useState } from "react";
import { ExcaliburWallet } from "@excalibur/wallet";
import Button from "./Button";
import { BottomMenuSpacing } from "./BottomMenu";
import { Connection, ConfirmOptions } from "@solana/web3.js";

export interface LoginPageProps {
    onWallet: (wallet: ExcaliburWallet) => void;
    onCancel: () => void;
    connection: Connection;
    confirmOptions?: ConfirmOptions;
}

export function LoginPage(props: LoginPageProps) {
    // ------------------------- PROPS -------------------------------

    const { onWallet, onCancel, connection, confirmOptions } = props;

    // ------------------------- STATE -------------------------------

    const [localLoading, setLocalLoading] = useState<boolean>(false);
    const [password, setPassword] = useState<string | undefined>();
    const [file, setFile] = useState<File | undefined>();
    const [fileSrc, setFileSrc] = useState<string | undefined>();

    React.useEffect(() => {
        setLocalLoading(false);
        setPassword(undefined);
        setFile(undefined);
        setFileSrc(undefined);
    }, []);

    // ------------------------- FUNCTIONS -------------------------------

    const setFormPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 0) {
            setPassword(e.target.value);
        } else {
            setPassword(undefined);
        }
    };

    const handleCancel = () => {
        onCancel();
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;

        if (!fileList || !fileList[0]) {
            setFile(undefined);
            return;
        }
        const newFile = fileList[0];
        setFile(newFile);
        setFileSrc(window.URL.createObjectURL(newFile));
    };

    const handleSubmit = () => {
        if (!file) return;

        setLocalLoading(true);

        ExcaliburWallet.fromFile(
            file,
            connection,
            confirmOptions,
            password
        ).then((wallet) => {
            setLocalLoading(false);
            onWallet(wallet);
        });
    };

    // ------------------------- HELPERS -------------------------------

    const getSrc = () => {};

    // ------------------------- RENDERERS -------------------------------
    const renderImgUpload = () => {
        return (
            <div className="walletImgRenderedContainer">
                {fileSrc ? (
                    <label className="">
                        <img
                            className="walletImgRendered mx-auto my-8 h-28 rounded drop-shadow-md"
                            src={fileSrc}
                        />
                        <input
                            accept=".jpeg,.png"
                            className="hidden "
                            name="recipientfile"
                            type="file"
                            placeholder="Select file"
                            multiple={false}
                            onChange={handleFileInput}
                        />
                    </label>
                ) : (
                    <img
                        className="walletImgRendered mx-auto my-8 h-28 rounded drop-shadow-md"
                        onClick={() => console.log("click")}
                        src="https://excal.tv/static/media/logo-ex-head.ddf7aa3b14a306d13073.png"
                    />
                )}
                <div className="mx-auto flex w-72 flex-col justify-center text-justify font-lora text-white">
                    {" "}
                    {fileSrc ? (
                        <>
                            <p>
                                {" "}
                                If you also have a password for additional
                                security please enter it now otherwise press log
                                in!{" "}
                            </p>{" "}
                            <p className="mt-4">
                                {" "}
                                You can click the Image to change it!
                            </p>
                        </>
                    ) : (
                        <p className="mx-auto"> Upload an Image to Log In</p>
                    )}
                </div>
                {fileSrc ? null : (
                    <label className="button relative mx-auto mt-4 flex w-72 items-center justify-center text-lg  transition-all ease-linear">
                        Upload
                        <input
                            accept=".jpeg,.png"
                            className="hidden"
                            name="recipientfile"
                            type="file"
                            placeholder="Select file"
                            multiple={false}
                            onChange={handleFileInput}
                        />
                    </label>
                )}
            </div>
        );
    };

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const renderPasswordAndLogin = () => {
        if (!fileSrc) return null;
        return (
            <div className="relative grid grid-cols-1 gap-y-4 pt-1 pb-4 ">
                <input
                    className="passwordFormField relative mx-auto mt-4 h-10 w-72 justify-center rounded py-2 text-left text-black placeholder:pl-2"
                    name="recipientfile"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password:"
                    onChange={setFormPassword}
                />
                <button
                    className="text-wrap absolute right-0 top-5 mx-auto flex h-10 w-4 items-center justify-center rounded-tr rounded-br bg-gray-200 px-8 text-center text-xs font-thin uppercase text-black
      "
                    onClick={handleShowPassword}
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
                <Button
                    className="button relative mx-auto flex w-72 items-center justify-center text-lg  transition-all ease-linear"
                    disabled={!fileSrc}
                    onClick={handleSubmit}
                    buttonLabel="Login"
                ></Button>
            </div>
        );
    };

    return (
        <>
            <div className="loginComponent flex h-[460px] flex-col content-center items-center justify-center">
                {renderImgUpload()}
                {renderPasswordAndLogin()}
                <Button
                    className="loginButton relative mx-auto mt-4 flex w-72 items-center justify-center rounded-md py-2 text-lg transition-all ease-linear hover:bg-opacity-40"
                    disabled={false}
                    onClick={handleCancel}
                    buttonLabel="Cancel"
                ></Button>
                <BottomMenuSpacing />
            </div>
        </>
    );
}

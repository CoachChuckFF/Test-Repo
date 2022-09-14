import React, { useState } from "react";
import HexagonPFP from "./HexagonPFP";
import { FontAwesomeIcon, FAProSolid } from "@excalibur/config/fontawesome";
import Link from "next/link";
import { ConnectButton } from "@excalibur/solana-provider";

export interface NavbarProps {
    currentHref: string;
}

export function SidebarSpacing() {
    return <div className="md:w-60 hidden" />;
}

function Navbar(props: NavbarProps) {
    const { currentHref } = props;
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // useEffect(() => {
    //   setShowMobileMenu(fals
    // }, [currentHref])

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);

        //TODO remove - a little hacky
    };

    const renderMobileLink = (href: string, icon: any, text: string) => {
        const isCurrentHref = href === currentHref;

        return (
            <Link
                href={href}
                onClick={() => {
                    setShowMobileMenu(false);
                }}
            >
                <a
                    className={`flex items-center gap-2 hover:bg-skin-button-accent px-6 py-4 w-full rounded ${
                        isCurrentHref ? "text-skin-muted" : ""
                    }`}
                >
                    <FontAwesomeIcon
                        icon={icon}
                        className="text-xl text-skin-muted w-8 flex justify-center"
                    />
                    <span className="">{text}</span>
                </a>
            </Link>
        );
    };

    const renderMobileNavMenu = () => {
        return (
            <div className="w-screen fixed  bg-skin-fill h-screen z-40 overflow-hidden">
                <div>
                    <img
                        className="w-16 absolute top-2 left-4"
                        src={"../assets/excalibur.png"}
                        alt=""
                    />
                    <button onClick={toggleMobileMenu}>
                        <FontAwesomeIcon
                            icon={FAProSolid.faClose}
                            className="text-4xl text-skin-muted w-8 flex justify-center absolute top-4 right-4"
                        />
                    </button>
                </div>

                <div className="items-start text-2xl w-fit mx-auto flex flex-col mt-32 space-y-8 font-bold ">
                    {renderMobileLink("/", FAProSolid.faCompass, "About")}
                    {renderMobileLink(
                        "/user",
                        FAProSolid.faCloudArrowUp,
                        "Upload Podcast"
                    )}
                    {renderMobileLink("/wallet", FAProSolid.faWallet, "Wallet")}
                    {renderMobileLink(
                        "/player",
                        FAProSolid.faPodcast,
                        "Player"
                    )}
                </div>

                <div className="mx-auto flex justify-center mt-24">
                    <ConnectButton />
                </div>
            </div>
        );
    };

    const renderMobileNav = () => {
        return (
            <div className="relative flex flex-row bg-skin-fill/40 backdrop-blur-md items-center space-x-4 w-screen justify-between h-20 mb-4 p-4">
                <img className="w-16" src={"../assets/excalibur.png"} alt="" />
                <button className="flex flex-col" onClick={toggleMobileMenu}>
                    {" "}
                    <FontAwesomeIcon
                        icon={FAProSolid.faBars}
                        className="text-2xl text-skin-muted w-8 flex justify-center"
                    />
                    <span className="font-thin text-xs uppercase">Menu</span>
                </button>
            </div>
        );
    };

    const [sidebarOpen, setSidebarOpen] = useState(true);
    function renderDesktopSideBar() {
        const handlesidebarOpen = () => {
            setSidebarOpen(!sidebarOpen);
        };

        return (
            <div
                className={`desktop-sidebar  relative px-4 pb-4  z-40  flex flex-col  h-screen transition-all ease-linear duration-100   ${
                    sidebarOpen ? " w-60  " : " w-24 "
                }`}
            >
                <img
                    className="w-16 mx-auto"
                    src={"../assets/excalibur.png"}
                    alt=""
                />
                <div className="mx-auto flex flex-col mt-14 space-y-8">
                    <div className="desktop-sidebar-item space-x-4 flex items-center">
                        <Link href="/">
                            <a className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={FAProSolid.faCompass}
                                    className="text-xl text-skin-muted w-8 flex justify-center"
                                />
                                <span
                                    className={sidebarOpen ? "block" : "hidden"}
                                >
                                    About{" "}
                                </span>
                            </a>
                        </Link>
                    </div>
                    <div className="desktop-sidebar-item space-x-4  flex items-center">
                        <Link href="/user">
                            <a className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={FAProSolid.faCloudArrowUp}
                                    className="text-xl text-skin-muted w-8 flex justify-center"
                                />
                                <span
                                    className={sidebarOpen ? "block" : "hidden"}
                                >
                                    Upload Podcast{" "}
                                </span>
                            </a>
                        </Link>
                    </div>
                    <div className="desktop-sidebar-item space-x-4 flex items-center">
                        <Link href="/wallet">
                            <a className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={FAProSolid.faWallet}
                                    className="text-xl text-skin-muted w-8 flex justify-center"
                                />
                                <span
                                    className={sidebarOpen ? "block" : "hidden"}
                                >
                                    Wallet
                                </span>
                            </a>
                        </Link>
                    </div>
                    <div className="desktop-sidebar-item space-x-4 flex items-center">
                        <Link href="/player">
                            <a className="flex items-center gap-2">
                                <FontAwesomeIcon
                                    icon={FAProSolid.faPodcast}
                                    className="text-xl text-skin-muted w-8 flex justify-center"
                                />
                                <span
                                    className={sidebarOpen ? "block" : "hidden"}
                                >
                                    Player{" "}
                                </span>
                            </a>
                        </Link>
                    </div>
                    <button onClick={handlesidebarOpen} className="hidden">
                        <FontAwesomeIcon
                            icon={FAProSolid.faArrowRight}
                            className={`fa-light fa-arrow-right top-1/2 -right-4 absolute z-40 text-3xl transition-all duration-1000 ${
                                sidebarOpen
                                    ? " -rotate-[180deg] "
                                    : "rotate-[360deg] "
                            }`}
                        />
                    </button>
                </div>
                <div className=" relative mt-auto bottom-10 left-1">
                    <HexagonPFP
                        src="https://excal.tv/static/media/logo-with-bg.c54a21e937da1d0f803a.jpg"
                        alt="profile picture"
                    />
                    <p className="flex flex-col mt-2 text-sm font-bold">
                        999.99
                        <span className="text-skin-muted font-thin">SOL</span>
                    </p>
                    <ConnectButton />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mobileNavbar fixed md:hidden drop-shadow-md z-40">
                {showMobileMenu ? renderMobileNavMenu() : null}
                {renderMobileNav()}
            </div>
            <div className="desktopSidebar hidden md:sticky md:flex md:top-0 md:z-40 flex-col h-screen">
                {renderDesktopSideBar()}
            </div>
        </>
    );
}

export default Navbar;

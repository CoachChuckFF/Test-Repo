import { PodcastThumbnail } from "@components/PodcastThumbnail";

import HexagonPFP from "@components/HexagonPFP";
import Image from "next/image";

import { FontAwesomeIcon, FAProSolid } from "@excalibur/config/fontawesome";
import AudioPlayer from "./AudioPlayer";
import { toast, ToastContainer } from "react-toastify";

import { render } from "react-dom";
import Toast from "@components/Toast";

function PlayerPageContent() {
    const renderLeftContent = () => {
        return (
            <div className="px-2">
                <div className="relative h-40 w-40 mx-auto">
                    {" "}
                    <Image
                        src="/mock/bloomberg.png"
                        alt="Bloomberg"
                        layout="fill"
                        className="h-40 w-40 rounded-2xl"
                    />
                </div>

                <div className="my-8 text-skin-base flex flex-row md:justify-between justify-around px-4 md:px-0 text-xs font-bold md:flex-col">
                    <p>12 Aug 2022</p>
                    <p>43m:07s</p>
                    <p>#014</p>
                </div>
                <div className="my-8 text-skin-base text-justify text-xs md:w-[90%]  mx-auto ">
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Nihil nulla, vel rerum quas, tempore aliquid dicta odit
                        nam recusandae mollitia quam assumenda sunt dolorem
                        animi consectetur suscipit aut autem ipsum? Lorem ipsum
                        dolor sit amet consectetur adipisicing elit. Nihil
                        nulla, vel rerum quas, tempore aliquid dicta odit nam
                        recusandae mollitia quam assumenda sunt dolorem animi
                        consectetur suscipit aut autem ipsum?
                    </p>
                </div>
            </div>
        );
    };

    const renderPodcastTitle = () => {
        return (
            <div className=" md:w-[90%] mx-auto">
                {" "}
                <p className="md:text-4xl text-lg font-bold">
                    How North Korea Became A Crypto Hacking Powerhouse
                </p>
                <div className="flex flex-row mt-4 space-x-4 items-center md:justify-start justify-center">
                    <p className="font-bold text-sm">
                        Bloomberg Crypto Podcast
                    </p>{" "}
                    <button className="btn h-8 px-4 text-xs">Follow</button>
                    <p className="text-skin-muted font-bold text-xs">24.3k</p>
                </div>
            </div>
        );
    };

    const renderActionMenu = () => {
        return (
            <>
                {" "}
                <div className="flex  flex-row p-8 items-center md:justify-between justify-around  md:w-[90%] ">
                    <div>
                        <button className="" onClick={() => toast("HI")}>
                            <FontAwesomeIcon
                                className="md:text-7xl text-2xl hover:text-buttonAccentHover transition-all"
                                icon={FAProSolid.faCirclePlay}
                            />
                        </button>
                    </div>
                    <div className="flex flex-col text-left items-center text-skin-muted md:mx-8 mx-4 ">
                        <p className="font-bold text-xs md:text-base">2.2k</p>
                        <p className="md:text-xs text-[0.5rem] ">donations</p>
                    </div>
                    <div className="flex flex-row gap-2 md:gap-4">
                        <button className="btn lg:px-8 md:px-4 h-8">
                            Donate
                        </button>
                        <button className="btn lg:px-8 md:px-4 h-8">
                            Mint NFT
                        </button>
                        <button className="btn lg:px-8 md:px-4 text- h-8">
                            Share / Earn
                        </button>
                        <button className="btn md:px-4 p-2 h-8">
                            {" "}
                            <FontAwesomeIcon
                                className="text-lg "
                                icon={FAProSolid.faBookmark}
                            />
                        </button>
                    </div>
                </div>
            </>
        );
    };

    const renderEpisodes = () => {
        return (
            <>
                <div className="flex flex-row items-center gap-x-2 md:gap-x-4 h-32 rounded-2xl px-2 bg-skin-button-accent justify-between w-fit">
                    <div className="">
                        <HexagonPFP
                            src="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iSUMGf0ESrKs/v0/1200x-1.png"
                            alt="pfp"
                        />
                    </div>
                    <div className="text-xs flex flex-col text-left w-1/2  ">
                        <p className="font-bold text-xs md:text-md ">
                            Biden&apos;s Approach to Crypto
                        </p>
                        <p className="mt-4 line-clamp-3 text-xs">
                            Lorem ipsumch dolor sit amet consectetur adipisicing
                            elit. Quaerat hic eligendi debitis magni officiis
                            tempore, autem explicabo reprehenderit excepturi,
                            quidem nulla consectetur consequuntur? Nesciunt
                            porro dicta vero fuga quia vitae.
                        </p>
                    </div>
                    <div className="">
                        {" "}
                        <button className="mx-auto">
                            <FontAwesomeIcon
                                className="md:text-4xl text-2xl hover:text-buttonAccentHover transition-all"
                                icon={FAProSolid.faCirclePlay}
                            />
                        </button>
                    </div>
                    <div className="flex flex-col text-right ">
                        <p className="md:text-lg font-bold text-skin-muted">
                            #015
                        </p>
                        <p className="md:text-[14px] text-xs text-skin-muted ">
                            16 Aug 2022
                        </p>
                        <p className="md:text-[16px] mt-2 text-xs text-skin-muted ">
                            104m:23s
                        </p>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="flex flex-col mt-16 md:mt-0 items-center container md:w-[90%]">
            <div className="flex justify-center items-center">
                <div className="md:grid md:grid-col-2 flex flex-col ">
                    <div className="">
                        <div className="pt-8 px-4 ">{renderLeftContent()}</div>
                    </div>
                    <div className="flex flex-col col-start-2 p-8 md:w-[90%] ">
                        {renderPodcastTitle()}
                        {renderActionMenu()}
                        <p className="ml-4 font-semibold">All Episodes</p>
                        <hr className="my-8" />
                        {renderEpisodes()}
                        <AudioPlayer
                            episodeTitle="How North Korea Became A Crypto Hacking Powerhouse"
                            podcastName="Bloomberg Crypto Podcast"
                            podcastImage="https://assets.bwbx.io/images/users/iqjWHBFdfxIU/iSUMGf0ESrKs/v0/1200x-1.png"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlayerPageContent;

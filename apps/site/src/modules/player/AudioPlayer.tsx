import HexagonPFP from "@components/HexagonPFP";
import { FontAwesomeIcon, FAProSolid } from "@excalibur/config/fontawesome";
import React from "react";

const AudioPlayer = (props?) => {
    const { episodeTitle, podcastName, podcastImage } = props;
    return (
        <div className="sticky bottom-4 left-2 md:left-60  w-full md:absolute md:bottom-10">
            <div className="md:w-[80%]  h-28 rounded-lg  bg-skin-fill/40 backdrop-blur-sm float-left relative flex p-4 items-center gap-x-2  border">
                {/* PFP */}
                <div className="relative left-0">
                    <HexagonPFP src={podcastImage} alt="" />
                </div>
                {/* PODCAST INFO */}
                <div className="w-full relative -top-2">
                    <p className="text-skin-base font-bold md:text-sm text-xs md:w-full w-70">
                        {episodeTitle}
                    </p>
                    <p className="text-skin-muted md:text-xs text-[0.5rem]">
                        {podcastName}
                    </p>
                </div>
                {/* PROGRESSBAR */}
                <div className="flex gap-x-2 absolute inset-x-auto bottom-2 left-10 w-full items-center">
                    <p className="text-xs text-skin-muted">1:11</p>
                    <div className="  w-7/12 md:w-9/12 lg:w-10/12 bg-skin-button-accent rounded-full h-2 ">
                        <div
                            className={`bg-textBase h-2 rounded-full w-1/2`}
                        ></div>
                    </div>
                    <p className="text-xs text-skin-muted">1:11</p>
                </div>
                {/* CONTROL BUTTONS */}
                <div className="flex items-center gap-x-2 absolute md:right-20 right-14">
                    <FontAwesomeIcon
                        className="md:text-lg text-2xl text- hover:text-buttonAccentHover transition-all"
                        icon={FAProSolid.faArrowRotateLeft}
                    />
                    <FontAwesomeIcon
                        className="md:text-3xl text-2xl hover:text-buttonAccentHover transition-all"
                        icon={FAProSolid.faCirclePlay}
                    />
                    <FontAwesomeIcon
                        className="md:text-lg text-2xl hover:text-buttonAccentHover transition-all"
                        icon={FAProSolid.faArrowRotateRight}
                    />
                </div>
                {/* RIGHT BUTTONS */}
                <div className="absolute right-4 flex flex-col gap-2">
                    {" "}
                    <FontAwesomeIcon
                        className="bg-skin-button-accent hover:bg-skin-button-accent-hover p-1 rounded md:text-lg text-base hover:text-buttonAccent transition-all"
                        icon={FAProSolid.faEllipsisH}
                    />
                    <FontAwesomeIcon
                        className="bg-skin-button-accent hover:bg-skin-button-accent-hover p-1 rounded md:text-lg text-base hover:text-buttonAccent transition-all"
                        icon={FAProSolid.faVolume}
                    />
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;

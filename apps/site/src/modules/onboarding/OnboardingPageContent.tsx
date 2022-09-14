// https://www.figma.com/file/prlcVs5JaW6oXAINeDYaGC/%E2%9C%8F%EF%B8%8F-Excalibur---Podcast-App---Milestone-2---Dev?node-id=94%3A4608
import React, { useState } from "react";

type onboardingPageOptions = "selection" | "creator" | "listener";

const OnboardingPageContent = (props: {}) => {
    const [onboardingStage, setOnboardingStage] =
        useState<onboardingPageOptions>("selection");

    const renderAccountTypePage = () => {
        return (
            <div className="relative w-[600px] text-center flex flex-col justify-center items-center mx-auto ">
                <p className="text-[28px] text-skin-base font-bold">
                    Welcome To Your New Account
                </p>
                <p className="text-[16px] mt-[32px]">
                    All accounts can upload podcasts by default. To continue
                    please choose
                    <strong> your account view mode</strong>. You&aposll be able
                    to <strong>listen</strong> to all creators&apos podcasts in
                    both display modes and <strong>switch</strong> back and
                    forth between the modes while{" "}
                    <strong>keeping all your data intact</strong>.
                </p>
                <div className="flex mt-[48px] space-x-[12px]">
                    <button
                        onClick={() => setOnboardingStage("creator")}
                        className="btn w-[160px] h-[48px]"
                    >
                        Creator
                    </button>
                    <button
                        onClick={() => setOnboardingStage("listener")}
                        className="btn w-[160px] h-[48px]"
                    >
                        Listener
                    </button>
                </div>
            </div>
        );
    };

    const renderPodcastPage = () => {
        return (
            <div className="relative w-[960px] text-center flex flex-col justify-center items-center mx-auto ">
                <p className="text-skin-base text-[28px] font-bold">
                    Account Details
                </p>
                <p className="w-[600px] mt-[32px]">
                    Please provide your podcast cover image, avatar, name, and
                    description. The name and avatar will be used in chats and
                    donations that you&aposll make. You can change these details
                    later at any time.
                </p>
                {/* UPLOAD PODCAST */}
                <div className="w-[800px] relative flex p-2 ">
                    <div className="w-[264px] h-[264px] rounded-xl  bg-skin-button-accent">
                        <div className="w-[150px] mt-[60px] mx-auto flex flex-col">
                            <p className="text-[13px] px-1">
                                Drag the podcast{" "}
                                <strong>cover image file</strong> here
                                <p className="mt-[12px]">or</p>
                            </p>
                            <button className="btn bg-skin-button-muted w-[100px] mx-auto mt-[12px]">
                                Browse
                            </button>
                        </div>
                        <p className="mt-[24px] text-[12px] w-[216px] font-thin text-skin-muted  mx-auto ">
                            JPG / PNG with 1:1 size ratio (min. 528x528 px) and
                            2 MB max file size
                        </p>
                    </div>
                    {/* UPLOAD THUMB AND INPUTS */}
                    <div className="w-[536px]">
                        <div>
                            <label>
                                <input type="text" placeholder="Podcast name" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderListenerPage = () => {
        return null;
    };

    return (
        <div className=" flex flex-col justify-center h-screen md:-ml-64 ">
            {onboardingStage === "selection" && renderAccountTypePage()}
            {onboardingStage === "creator" && renderPodcastPage()}
            {onboardingStage === "listener" && renderListenerPage()}
        </div>
    );
};

export default OnboardingPageContent;

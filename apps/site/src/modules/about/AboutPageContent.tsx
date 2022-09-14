import Modal from "@components/modal/Modal";
import React, { useState } from "react";

function AboutPageContent() {
    const [modalOpen, setModalOpen] = useState(false);
    const toggleModalOpen = () => {
        setModalOpen(!modalOpen);
    };

    const renderCreateAccount = () => {
        return (
            <div className="relative w-[600px] h-full text-center flex flex-col justify-center items-center mx-auto">
                <p className="text-[28px] text-skin-base font-bold">
                    Welcome To Your New Account
                </p>
                <p className="text-[16px] mt-[32px]">
                    All accounts can upload podcasts by default. To continue
                    please choose
                    <strong> your account view mode</strong>. You’ll be able to{" "}
                    <strong>listen</strong> to all creators’ podcasts in both
                    display modes and <strong>switch</strong> back and forth
                    between the modes while{" "}
                    <strong>keeping all your data intact</strong>.
                </p>
                <div className="flex mt-[48px] space-x-[12px]">
                    <button className="btn w-[160px] h-[48px]">Creator</button>
                    <button className="btn w-[160px] h-[48px]">Listener</button>
                </div>
                <button
                    className="absolute btn bg-buttonMuted bottom-[40px]"
                    onClick={toggleModalOpen}
                >
                    Cancel
                </button>
            </div>
        );
    };

    return (
        <div className="container mx-auto md:mx-0 skin">
            <section className="2xl:py-40 relative mb-auto overflow-hidden py-20">
                <div className="relative  mx-auto px-4 ">
                    <div>
                        <button onClick={toggleModalOpen}>Open Modal</button>

                        <Modal isOpen={modalOpen}>
                            {renderCreateAccount()}
                        </Modal>

                        <div className="-mx-10 flex flex-wrap  ">
                            <div className="lg: relative z-10 mb-10 w-full px-10 lg:mb-20 lg:w-1/2">
                                <div className="h-full rounded-lg bg-skin-button-accent/20 px-8 pt-16 pb-24 drop-shadow-md backdrop-blur  md:px-16">
                                    {/* <ModalVideos
                    className="my-auto  md:mt-0"
                    htmlFor="excaliburIntro"
                    src="https://www.youtube.com/embed/DLO_tRDIuwM?autoplay=0"
                  /> */}
                                    <span className="mb-10 flex h-16 w-16 items-center justify-center bg-skin-button-accent rounded-lg bg-"></span>

                                    <h2 className="font-bold mt-12 mb-8 text-white md:text-2xl">
                                        WHAT IS EXCALIBUR?{" "}
                                    </h2>
                                    <p className="text-md text-justify text-gray-200 md:text-lg">
                                        Excalibur is a decentralized podcasting
                                        platform that enables podcasters to
                                        connect directly with their audience. It
                                        enables direct monetization for the
                                        creators through peer-to-peer
                                        broadcasting. Blockchain technology is
                                        used to make payments quick and easy
                                        with incredibly low transaction fees. We
                                        remove the need to include advertising
                                        in the content by taking out the ‘man in
                                        the middle’ so that payments go directly
                                        to the creators.
                                    </p>
                                </div>
                            </div>
                            <div className="lg: relative mb-10 w-full px-10 lg:mb-20 lg:w-1/2">
                                <div className="h-full rounded-lg bg-skin-button-accent/20 px-8 pt-16 pb-24 drop-shadow-md backdrop-blur  md:px-16">
                                    {/* <ModalVideos
                    className="my-auto  md:mt-0"
                    htmlFor="howExcaliburWorks"
                    src="https://www.youtube.com/embed/3y-PTX0L3RE?autoplay=0"
                  />{" "} */}
                                    <span className="mb-10 flex h-16 w-16 items-center justify-center rounded-lg bg-skin-button-accent"></span>

                                    <h2 className="font-bold mt-12 mb-8 text-white md:text-2xl">
                                        HOW DOES EXCALIBUR WORK
                                    </h2>
                                    <p className="text-md text-justify text-gray-200 md:text-lg">
                                        Podcasters upload their content free of
                                        advertising to Excalibur and the
                                        platform generates a link that they will
                                        send directly to their audience.
                                        Clicking on the link will take the
                                        customer to a page where they will
                                        listen to the podcast. While they
                                        listen, the listener is presented with a
                                        QR code on the page in front of them
                                        that can be scanned by a crypto wallet.
                                        The content itself is open source, but
                                        if they like it, they can chose promote
                                        the production of future podcasts by
                                        making a payment using the information
                                        on the page.
                                    </p>
                                </div>
                            </div>
                            <div className="lg: relative mb-10 w-full px-10 lg:mb-20 lg:w-1/2">
                                <div className="h-full rounded-lg bg-skin-button-accent/20 px-8 pt-16 pb-24 drop-shadow-md backdrop-blur  md:px-16">
                                    {/* <ModalVideos
                    className="my-auto md:mt-0"
                    htmlFor="communityVideo"
                    src="https://www.youtube.com/embed/Zh4e90VOI18?autoplay=0"
                  /> */}
                                    <span className="mb-10 flex h-16 w-16 items-center justify-center rounded-lg bg-skin-button-accent"></span>

                                    <h2 className="font-bold mt-12 mb-8 text-white md:text-2xl">
                                        THE COMMUNITY{" "}
                                    </h2>
                                    <p className="text-md text-justify text-gray-200 md:text-lg">
                                        Customers can mint an NFT of the podcast
                                        which gives them access to an exclusive
                                        community where they can speak directly
                                        with the creators and other like minded
                                        people that chose to pay for the
                                        content. The podcaster can build
                                        community by including a message in the
                                        podcast to the audience. An indication
                                        can be made to the listener that this
                                        special edition of the podcast sent it
                                        directly to them without any
                                        advertising. A sense of exclusivity can
                                        be generated when the audience is told
                                        that it was sent out a number of days
                                        before it will go live on any of the
                                        centralised advertising platforms.{" "}
                                    </p>
                                </div>
                            </div>
                            <div className="lg: relative mb-10 w-full px-10 lg:mb-20 lg:w-1/2">
                                <div className="h-full rounded-lg bg-skin-button-accent/20 px-8 pt-16 pb-24 drop-shadow-md backdrop-blur  md:px-16">
                                    <span className="mb-10 flex h-16 w-16 items-center justify-center rounded-lg bg-skin-button-accent"></span>
                                    <h2 className="font-bold mt-12 mb-8 text-white md:text-2xl">
                                        THE NETWORK EFFECT
                                    </h2>
                                    <p className="text-md text-justify text-gray-200 md:text-lg">
                                        The community of listeners are
                                        incentivized to become broadcasters by
                                        allowing them to generate a unique link
                                        to the podcast that will include their
                                        crypto wallet in the future revenue
                                        stream. They can earn an income by
                                        distributing podcasts to people whom
                                        they think will appreciate them. The
                                        Blockchain rewards people in the network
                                        for the work that they do in growing the
                                        audience for the podcaster. Smart
                                        contracts enable the revenue to be
                                        automatically spilt between the creators
                                        and the network of broadcasters. This is
                                        Web 3, no legal contracts are required,
                                        no accounts department, no invoicing and
                                        no chasing people for money.{" "}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutPageContent;

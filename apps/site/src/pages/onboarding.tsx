import type { NextPage } from "next";
import Head from "next/head";
import OnboardingPageContent from "@modules/onboarding/OnboardingPageContent";
import Footer from "@components/Footer";
import PageContent from "@components/PageContent";
import Navbar from "@components/Navbar"; // This should probably be the default page

const OnboardingPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Excalibur</title>
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
            </Head>
            <div className="flex transition-all duration-700 ">
                <Navbar currentHref="/player" />
                <div>
                    <PageContent>
                        <OnboardingPageContent />
                    </PageContent>
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default OnboardingPage;

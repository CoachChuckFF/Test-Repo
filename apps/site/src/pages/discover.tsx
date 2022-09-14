import type { NextPage } from "next";
import Head from "next/head";
import DiscoverPageContent from "@modules/discover/DiscoverPageContent";
import Footer from "@components/Footer";
import PageContent from "@components/PageContent";
import Navbar from "@components/Navbar";

const DiscoverPage: NextPage = () => {
    //This is how routing works in Next.js
    return (
        <>
            <Head>
                <title>Excalibur - Discover Page</title>
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
            </Head>
            <div className="flex transition-all duration-700 ">
                <Navbar currentHref="/discover" />
                <div>
                    <PageContent>
                        <DiscoverPageContent />
                    </PageContent>
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default DiscoverPage;

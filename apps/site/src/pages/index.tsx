import type { NextPage } from "next"
import Head from "next/head"
import AboutPageContent from "@modules/about/AboutPageContent"
import Footer from "@components/Footer"
import PageContent from "@components/PageContent"
import Navbar from "@components/Navbar"
import HeroSection from "@modules/about/hero/HeroSection"
import Modal from "@components/modal/Modal"

// Good Reading Material
// https://nextjs.org/docs/api-reference/next/head
//

/**
 * Index/About Page
 *
 * The page that will first be shown
 */
const IndexPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Excalibur</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <div className="flex transition-all duration-700 container">
        <Navbar currentHref="/" />
        <div className="App w-full md:mt-0 mt-20 container ">
          <HeroSection />
          <PageContent>
            <AboutPageContent />
          </PageContent>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default IndexPage

import type { NextPage } from "next"
import Head from "next/head"
import PlayerPageContent from "@modules/player/PlayerPageContent"
import Footer from "@components/Footer"
import PageContent from "@components/PageContent"
import Navbar from "@components/Navbar"

const PlayerPage: NextPage = () => {
  //This is how routing works in Next.js
  return (
    <>
      <Head>
        <title>Excalibur</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="flex transition-all duration-700 ">
        <Navbar currentHref="/player" />
        <div>
          <PageContent>
            <PlayerPageContent />
          </PageContent>
          <Footer />
        </div>
      </div>
    </>
  )
}

export default PlayerPage

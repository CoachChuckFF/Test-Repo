import heroImage from "./heroImage.webp"

function HeroSection() {
  //This is how routing works in Next.js

  return (
    <div className=" relative bg-skin-fill mx-auto overflow-hidden w-screen">
      <img
        className="absolute inset-0 h-full w-screen object-cover opacity-30"
        src={heroImage.src}
        alt="People working on laptops"
      />
      <div className="absolute inset-0 bg-gradient-br-to from-skin-hue via-skin-hue to-transparent opacity-90"></div>
      <div className="relative max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-skin-base sm:text-4xl">
          <span className="block md:text-6xl text-5xl">EXCALIBUR</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-skin-muted">
          PODCASTING - DEMOCRATISED - DECENTRALISED
        </p>
        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
          <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
            <button>
              <a href="#" className="btn">
                {" "}
                Get started{" "}
              </a>
            </button>
            <a href="#" className="btn">
              Live demo{" "}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection

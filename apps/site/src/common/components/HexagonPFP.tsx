export interface HexagonPFPProps {
  src: string
  alt: string
}

export function HexagonPFP(props: HexagonPFPProps) {
  const { src, alt } = props

  return (
    <div className="hex flex justify-center items-center   ">
      <img className="w-12 mr-auto " id="profilePicture" src={src} alt={alt} />
    </div>
  )
}

export default HexagonPFP

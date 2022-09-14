export interface PodcastThumbnailProps {
  src: string
  alt?: string
}

export function PodcastThumbnail(props: PodcastThumbnailProps) {
  const { src, alt } = props

  return (
    <div className="aspect-square ">
      <img className="rounded-xl" src={src} alt={alt} />
    </div>
  )
}

export default PodcastThumbnail

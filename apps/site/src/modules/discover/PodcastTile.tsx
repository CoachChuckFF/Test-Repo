// https://www.figma.com/file/prlcVs5JaW6oXAINeDYaGC/%E2%9C%8F%EF%B8%8F-Excalibur---Podcast-App---Milestone-2---Dev?node-id=94%3A4608

export interface PodcastTileProps {
    title: string;
    date: string;
    time: number;
    imgUrl: string;
}

export function PodcastTile(props: PodcastTileProps) {
    const { title, date, time, imgUrl } = props;

    return (
        <div>
            <p>{title}</p>
        </div>
    );
}

export default PodcastTile;

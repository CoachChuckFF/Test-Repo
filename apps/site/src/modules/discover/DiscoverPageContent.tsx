import { PodcastTile, PodcastTileProps } from "./PodcastTile";
// https://www.figma.com/file/prlcVs5JaW6oXAINeDYaGC/%E2%9C%8F%EF%B8%8F-Excalibur---Podcast-App---Milestone-2---Dev?node-id=94%3A4608

//TODO createDummyPodcasts(account: number)

const DUMMYPODCASTS = [
    {
        title: "test",
        date: "3",
        time: 3,
        imgUrl: "test",
    },
    {
        title: "test",
        date: "3",
        time: 3,
        imgUrl: "test",
    },
    {
        title: "test",
        date: "3",
        time: 3,
        imgUrl: "test",
    },
] as PodcastTileProps[];

function DiscoverPageContent() {
    const renderTopBar = () => {
        return <h1>Discover Episodes</h1>;
    };

    //TODO: Make into a grid
    const renderPodcastTileGrid = () => {
        return (
            <>
                {DUMMYPODCASTS.map((podcast) => {
                    return renderPodcastTile(podcast);
                })}
            </>
        );
    };

    const renderPodcastTile = (props: PodcastTileProps) => {
        //const { title, date, time, imgUrl } = props;
        return (
            <PodcastTile
                title={props.title}
                date={props.date}
                time={props.time}
                imgUrl={props.imgUrl}
            />
        );
    };

    return (
        <>
            {renderTopBar()}
            {renderPodcastTileGrid()}
        </>
    );
}

export default DiscoverPageContent;

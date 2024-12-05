import "./Tile.css";

interface Props {
    image?: string;
    number: number;
    highlight: boolean;
    menu: boolean;
}

export default function Tile({number, image, highlight, menu}: Props) {
    const className: string = [
        "tile",
        number % 2 === 0 && "black-tile",
        number % 2 !== 0 && "white-tile",
        menu && "menu-tile",
        highlight && "tile-highlight",
        image && "chess-piece-tile"
        ].filter(Boolean).join(' ');
    return (
        <div className={className}>
            {image && <div style={{backgroundImage: `url(${image})`}} className="chess-piece"></div>}
        </div>
    );    
} 
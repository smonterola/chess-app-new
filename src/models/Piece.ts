import { PieceType, PieceColor } from "../Constants";
import { PositionMap } from "./MapAliases";
import { Position } from "./Position";

const parent = "assets/images/";
const pieceSet = "default"
const extension = ".png"

export class Piece {
    image: string;
    position: Position;
    type: PieceType;
    color: PieceColor;
    moveMap?: PositionMap; //get rid of this later
    constructor(
        position: Position, 
        type: PieceType, 
        color: PieceColor,
        moveMap: PositionMap = new Map(),
    ){
        this.image = `${parent}${pieceSet}/${color}${type}${extension}`;
        this.position = position;
        this.type = type;
        this.color = color;
        this.moveMap = moveMap;
    } 
    get clone(): Piece {
        return new Piece(
            this.position.clone,
            this.type,
            this.color,
            this.moveMap,
        );
    }
    get POV(): number {
        return this.color === PieceColor.WHITE ? 1 : -1;
    }
}

export function getPOV(color: PieceColor): number {
    return color === PieceColor.WHITE ? 1 : -1;
}
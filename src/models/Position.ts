import { PieceColor, PieceType, xAxis, yAxis } from "../Constants";
import { PieceMap } from "./MapAliases";

export class Position {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    get copyPosition(): Position {
        return new Position(this.x, this.y);
    }
    get string(): string {
        return `${xAxis[this.x]}${yAxis[this.y]}`;
    }
    get checkBounds(): boolean {
        return (
            this.x >= 0 && this.x <= 7 &&
            this.y >= 0 && this.y <= 7
        )
    }
    addPositions(p: Position): Position {
        return new Position(this.x + p.x, this.y + p.y);
    }
    samePosition(p: Position): boolean {
        return this.x === p.x && this.y === p.y;
    }
    isOccupied(pieceMap: PieceMap): boolean {
        return pieceMap.has(this.string);
    }
    canCapture(pieceMap: PieceMap, color: PieceColor): boolean {
        if (this.isOccupied(pieceMap) && 
            pieceMap.get(this.string)!.color !== color &&
            pieceMap.get(this.string)!.type === PieceType.KING) {
                //console.log("illegal move")
                //console.log(this.x, this.y)
                //console.log(pieceMap)
            }
        return (
            this.isOccupied(pieceMap) && 
            pieceMap.get(this.string)!.color !== color //&&
            //pieceMap.get(this.string)!.type !== PieceType.KING
        );
    }
    get clone(): Position {
        return new Position(this.x, this.y);
    }
}
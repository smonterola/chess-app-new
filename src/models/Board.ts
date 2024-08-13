import { PieceColor } from "../Constants";
import { PieceMap } from "./MapAliases";

export class Board {
    private _board: PieceMap;
    private _attributes: number[];
    constructor(
        board: PieceMap,
        attributes: number[]
    ){
        this._board = board;
        this._attributes = attributes;
    }
    setBoard(
        board: PieceMap,
    ): void {
        this._board = board;
    }
    setAttributes(
        turn: PieceColor, 
        wShort: boolean,
        wLong: boolean,
        bShort: boolean,
        bLong: boolean,
        enPassant: number,
        halfMoves: number,
        moveCount: number,
    ): void { //make this a bitset later
        this._attributes = [
            (turn === PieceColor.WHITE) ? 1 : 0,
            (wShort) ? 1 : 0,
            (wLong)  ? 1 : 0,
            (bShort) ? 1 : 0,
            (bLong)  ? 1 : 0,
            enPassant,
            halfMoves,
            moveCount,
        ];
    }
    get pieces(): PieceMap {
        return this._board;
    }
    get attributes(): number[] {
        return this._attributes;
    }
}
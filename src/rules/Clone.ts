import { Piece, PieceMap, PositionMap } from "../models";

//DEEP CLONING
export function deepClone(pieceMap: PieceMap): PieceMap {
    const clonePieceMap: PieceMap = new Map();
    for (const piece of pieceMap.values()) {
        const key: string = piece.position.string;
        const cloneMoveMap: PositionMap = cloneMoves(piece.moveMap!);
        const clonePiece: Piece = piece.clone;
        clonePiece.moveMap = cloneMoveMap;

        clonePieceMap.set(key, clonePiece);
    }
    //console.log("deep cloning")
    return clonePieceMap;
}

export function cloneMoves(positionMap: PositionMap): PositionMap {
    const cloneMoveMap: PositionMap = new Map();
    for (const destination of positionMap.values()) {
        cloneMoveMap.set(destination.string, destination.clone);
    } 
    return cloneMoveMap;
}
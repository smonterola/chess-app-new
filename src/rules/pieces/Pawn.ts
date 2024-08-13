import { Board, getPOV, PieceMap, Position, PositionMap } from "../../models";
import { PieceColor, PieceType } from "../../Constants";
import { rawPawnDirections } from "./Directions";

export function movePawn (
    board: Board,
    p: Position,
): PositionMap {
    const pieceMap = board.pieces;
    const [colorCode, _wS, _wL, _bS, _bL, enPassantRank] = board.attributes;
    const color = colorCode ? PieceColor.WHITE : PieceColor.BLACK;

    const pawnMap: PositionMap = new Map();
    const [OG, rank] = colorCode ? [1, 4] : [6, 3];
    const POV = getPOV(color);

    const pawnDirections = rawPawnDirections.map(p => new Position(p.x*POV, p.y*POV))
    const pawnCanidates: Position[] = [];

    for (let i = 0; i < 6; i++) {
        pawnCanidates.push(p.addPositions(pawnDirections[i]));
    }
    const [upperLeft, upperRight, upOne, upTwo, left, right] = pawnCanidates;
    const enPassantSquare = new Position(enPassantRank, rank);

    if (upperLeft.canCapture(pieceMap, color) ||
        left.samePosition(enPassantSquare)
    ) {
        pawnMap.set(upperLeft.string, upperLeft);
    }
    if (upperRight.canCapture(pieceMap, color) ||
        right.samePosition(enPassantSquare)
    ) {
        pawnMap.set(upperRight.string, upperRight);
    }
    if (!upOne.isOccupied(pieceMap)) {
        pawnMap.set(upOne.string, upOne);
        if (p.y === OG && !upTwo.isOccupied(pieceMap)) {
            pawnMap.set(upTwo.string, upTwo);
        }
    }
    return pawnMap;
}
import { Piece, PieceMap, Position, PositionMap } from "../../models";
import { pieceDirectons } from "../pieces/Directions";

export const mapMoves = (
    pieceMap: PieceMap,
    piece: Piece,
): PositionMap => {
    const moveMap: PositionMap = new Map();
    const [directions, once] = pieceDirectons.get(piece.type)!;
    for (const direction of directions) {
        let tempPosition: Position = piece.position.addPositions(direction);
        while (tempPosition.checkBounds) {
            if (!tempPosition.isOccupied(pieceMap)) {
                moveMap.set(tempPosition.string, tempPosition.copyPosition);
                tempPosition = tempPosition.addPositions(direction);
                if (!once) { //limiting knights and kings to only one move per direction
                    continue; //if it is a piece that can move move in space, then continue and loop again
                }
            } else if (tempPosition.canCapture(pieceMap, piece.color)) {
                moveMap.set(tempPosition.string, tempPosition.copyPosition);
            }
            break; //loop only once unless specifically allowed to go again
        }
    }
    return moveMap;
}
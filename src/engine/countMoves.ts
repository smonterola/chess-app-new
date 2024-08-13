import { GameState, PieceColor, nextTurn } from "../Constants";
import { Board, Piece } from "../models";
import { findKingKey } from "../rules";
import Rules from "../rules/Rules";

export function sumMoves(
    board: Board, 
    depth: number,
    color: PieceColor,
    path: string[],
    kingKey: string,
    nextKing: string,
): number {
    const pieceMap = board.pieces;
    if (depth <= 0) {
        return 1;
    }
    kingKey = findKingKey(pieceMap, kingKey, (color));
    const king: Piece = pieceMap.get(kingKey)!;
    const rules = new Rules();
    const [newBoard, nextBoards] = rules.populateValidMoves(board, king, nextKing);
    const newPieceMap = newBoard.pieces;
    const status = rules.getStatus(nextBoards, newPieceMap, king);
    switch(status) {
        case GameState.CHECKMATE:
            return 0;
        case GameState.STALEMATE:
            return 0;
    }
    let bestPath = 0;
    for (const [move, branchBoard] of nextBoards) {
        const branchMap = branchBoard.pieces
        bestPath += sumMoves(
            branchBoard,      (depth-1),
            nextTurn(color), path,
            nextKing,         kingKey,
        );
    }
    return bestPath;
}
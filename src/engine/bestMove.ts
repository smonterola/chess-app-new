import { nextTurn, PieceColor } from "../Constants";
import { Board, BoardMap, Piece } from "../models";
import { miniMaxAlphaBeta } from "./MiniMax";
import { findKingKey } from "../rules";
import Rules from "../rules/Rules";

export function botPlay(board: Board, boardMap: BoardMap): [string, Board, BoardMap] {
    const botTurn = (board.attributes[0]) ? PieceColor.WHITE : PieceColor.BLACK;
    console.log("searching for the best move:")
    const start = performance.now();
    const bestMoveScore = miniMaxAlphaBeta(board, 6, 2, -9999, 9999, botTurn, [], "e1", "e1");
    const end = performance.now();
    const move = bestMoveScore[0][0];
    console.log("best sequence", bestMoveScore[0], "has an evaluation of", bestMoveScore[1])
    console.log("evaluation time:", Math.round(end - start)/1000, "seconds");
    const newBoard = boardMap.get(move)!;
    if (!newBoard) {
        return ["GAME OVER", board, boardMap]
    }
    const pieceMap = newBoard.pieces;
    const [whiteKingKey, blackKingKey] = [
        findKingKey(pieceMap, "e1", PieceColor.WHITE), 
        findKingKey(pieceMap, "e8", PieceColor.BLACK)
    ];
    const [kingKey, otherKey] = nextTurn(botTurn) === PieceColor.WHITE ? [whiteKingKey, blackKingKey] : [blackKingKey, whiteKingKey];
    const king: Piece = pieceMap.get(kingKey)!;
    const nextBoards = new Rules().populateValidMoves(newBoard, king, otherKey)[1];
    return [move, newBoard, nextBoards];
}
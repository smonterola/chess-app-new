import { nextTurn, PieceColor } from "../Constants";
import { Board, BoardMap, Piece } from "../models";
import { miniMaxAlphaBeta } from "./MiniMax";
import { boardToFen, findKingKey } from "../rules";
import { miniMax } from "./MiniMax/iterDeep";
import { readBook } from "./API/callBook";
import { fixFen } from "../rules";
import Rules from "../rules/Rules";
import { iterativeDeepening } from "./MiniMax/iterDeep";

export function botPlay(board: Board, boardMap: BoardMap): [string, Board, BoardMap] {
    const botTurn = (board.attributes[0]) ? PieceColor.WHITE : PieceColor.BLACK;
    console.log(readBook(fixFen(boardToFen(board))))
    console.log("searching for the best move:")
    const start = performance.now();
    const bestMoveScore = iterativeDeepening(board, 5000, botTurn, [], "e1", "e1");
    const end = performance.now();
    const move = bestMoveScore[0][0];
    const iterTime = Math.round(end - start)/1000.
    console.log("iter evaluation time:", iterTime, "seconds");
    console.log("best sequence", bestMoveScore[0], "has an evaluation of", bestMoveScore[1])

    /*
    const start1 = performance.now();
    const bestMoveScore1 = miniMax(board, 5, 0, -9999, 9999, botTurn, [], [], "e1", "e1");
    const end1 = performance.now();
    const move1 = bestMoveScore1[0][0];
    const miniTime =  Math.round(end1 - start1)/1000
    console.log("mini evaluation time:", miniTime, "seconds");
    //console.log("best sequence", bestMoveScore1[0], "has an evaluation of", bestMoveScore1[1])
    */

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
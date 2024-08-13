import { GameState, PieceColor } from "../Constants";
import { Board, BoardMap, Piece, PieceMap, getPOV } from "../models";
import { findKingKey } from "../rules";
import Rules from "../rules/Rules";
import { evaluate } from "./EvaluateBoard";

type MovesScore = [string[], number];

export function miniMaxAlphaBeta(
    board: Board, 
    depth: number,
    futile: number,
    alpha: number,
    beta: number,
    color: PieceColor,
    path: string[],
    kingKey: string,
    nextKing: string,
): MovesScore {
    const pieceMap = board.pieces;
    /* base case */
    if (depth <= 0) {
        return [path, evaluate(pieceMap)];
    }
    const fiftyMoveDraw: boolean = board.attributes[6] >= 50;
    if (fiftyMoveDraw) {
        return [path, 0];
    }
    /* recursion */
    kingKey = findKingKey(pieceMap, kingKey, (color));
    const king: Piece = pieceMap.get(kingKey)!;
    const rules = new Rules();
    const [newBoard, nextBoards] = rules.populateValidMoves(board, king, nextKing);
    const newPieceMap = newBoard.pieces;
    const status = rules.getStatus(nextBoards, newPieceMap, king);
    /* end if the game is over */
    switch(status) {
        case GameState.CHECKMATE:
            return [path, -1000 * getPOV(color)];
        case GameState.STALEMATE:
            return [path, 0];
    }
    const size = newPieceMap.size;
    const futility: boolean = (depth <= futile) ? true : false
    let stop: number = 1;
    let bestPath: string[] = path;
    if (color === PieceColor.WHITE) {
        let maxEval = -4096;
        for (const [move, branchBoard] of sortMoves(nextBoards)) {
            const branchMap = branchBoard.pieces
            let stop = 1;
            if (futility) {
                if (branchMap.size - 0 === size) {
                    stop = 0;
                } else {
                     //if theres a last min capture, then stop because we need to always let the opponent respond
                }
            }
            const [moves, evaluation] = miniMaxAlphaBeta(
                branchBoard,      (depth-1)*stop,   futile,
                alpha,            beta,
                PieceColor.BLACK, path,
                nextKing,         kingKey,
            );
            maxEval = Math.max(maxEval, evaluation);
            if (maxEval > alpha) {
                alpha = maxEval;
                bestPath = [move, ...moves];
            }
            if (beta <= alpha) {
                break;
            }
        }
        return [bestPath, maxEval];
    } else { /* color === PieceColor.BLACK */
        let minEval = 4096;
        for (const [move, branchBoard] of sortMoves(nextBoards)) {
            const branchMap = branchBoard.pieces;
            let stop = 1;
            if (futility) {
                if (branchMap.size - 0 === size) {
                    stop = 0;
                } else {
                     //if theres a last min capture, then stop because we need to always let the opponent respond
                }
            }
            const [moves, evaluation] = miniMaxAlphaBeta(
                branchBoard,      (depth-1)*stop,   futile,
                alpha,            beta,
                PieceColor.WHITE, path,
                nextKing,         kingKey,
            );
            minEval = Math.min(minEval, evaluation);
            if (minEval < beta) {
                beta = minEval;
                bestPath = [move, ...moves];
            }
            if (beta <= alpha) {
                break;
            }
        }
        return [bestPath, minEval];
    }
}

export function sortMoves(boardMap: BoardMap) {
    let moveNBoard: [string, Board][] = [...boardMap.entries()];
    const priority: [string, number][] = [
        ["h",-1], ["a",-1], ["f",-1], 
        //the edges and moving the pawn in front of the king is the worst
        ["1", 1], ["8", 1], ["7", 1], ["2", 1], 
        //these ranks are on the end, they can be considered last
        ["g", 1], ["b", 1], ["c", 1], 
        //these files are not that good, but not the worst
        ["Q", 1], ["R", 1], ["B", 1], ["N", 1], 
        //these prioritize pieces over pawns
        ["d", 1], ["e", 1], ["O", 1], 
        //favor movement in the center files and castling
        ["4", 1], ["5", 1], 
        //look for moving into the center ranks
        ["K",-1], 
        //make king moves last
        ["+", 1], 
        //make checks second most important
        ["x", 1], ["=", 1],
        //prioritize captures and promotion
    ]
    for (const [char, weight] of priority) {
        moveNBoard = moveNBoard.sort((a,b) => sortByChar(a[0], b[0], char, weight));
    }
    return moveNBoard;
}
function sortByChar(a: string, b: string, char: string, direction: number) {
    if ((a.includes(char)) && !(b.includes(char))) {
        return -1*direction;
    } else if (!(a.includes(char)) && (b.includes(char))) {
        return 1*direction;
    }
    return 0;
}
/*

find the best move at each depth
one it is found let the next iteration use that key to find the 




*/
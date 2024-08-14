import { GameState, PieceColor } from "../../Constants";
import { Board, BoardMap, Piece, getPOV } from "../../models";
import { findKingKey } from "../../rules";
import Rules from "../../rules/Rules";
import { evaluate } from "./EvaluateBoard";
import { history } from "../../components/Chessboard/Chessboard";
import { boardToFen } from "../../rules";

type MovesScore = [string[], number];
//const start = performance.now();

export function iterativeDeepening(
    board: Board, 
    limit: number,
    futile: number,
    color: PieceColor,
    previousPath: string[],
    kingKey: string,
    nextKing: string,
): MovesScore { 
    let bestVariation: MovesScore = [previousPath, 0];
    const start = performance.now();
    for (let i = 0; i <= 40; i++) {
        const newVariation = miniMax(
            board, i, futile, -9999, 9999,
            color, [], bestVariation[0],
            kingKey, nextKing, start, limit
        );
        if (newVariation[0][0] !== "terminated") {
            bestVariation = newVariation;
        } else {
            break;
        }
        if (Math.abs(newVariation[1]) >= 1000) {
            return bestVariation;
        }
        console.log(bestVariation)
        //console.log(bestVariation[0])
    }
    return bestVariation;
}
export function miniMax(
    board: Board, 
    depth: number,
    futile: number,
    alpha: number,
    beta: number,
    color: PieceColor,
    currentPath: string[],
    previousPath: string[],
    kingKey: string,
    nextKing: string,
    start: number,
    limit: number,
): MovesScore {
    const pieceMap = board.pieces;
    /* base case */
    if (depth <= 0) {
        return [currentPath, evaluate(pieceMap)];
    }
    const drawPenalty = -0.1*getPOV(color);
    const pieceFen = boardToFen(board).split(" ")[0];
    const fiftyMoveDraw: boolean = board.attributes[6] >= 49;
    if (fiftyMoveDraw || history.get(pieceFen) === 2) {
        return [currentPath, drawPenalty];
    }
    if ((performance.now() - start) > limit) {
        return [["terminated"], 0];
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
            return [currentPath, (-1000 - depth) * getPOV(color)]; //this way it favors faster checkmates
        case GameState.STALEMATE:
            return [currentPath, drawPenalty];
    }
    const size = newPieceMap.size;
    const futility: boolean = (depth <= futile) ? true : false
    let bestPath: string[] = currentPath;
    if (color === PieceColor.WHITE) {
        let maxEval = -4096;
        for (const [move, branchBoard] of sortMoves(nextBoards, previousPath)) {
            const branchMap = branchBoard.pieces
            let stop = 1;
            if (futility) {
                if (branchMap.size - 0 === size) {
                    stop = 0;
                } else {
                     //if theres a last min capture, then stop because we need to always let the opponent respond
                }
            }
            const [moves, evaluation] = miniMax(
                branchBoard,      (depth-1)*stop,   futile,
                alpha,            beta,
                PieceColor.BLACK, currentPath, previousPath, 
                nextKing,         kingKey, start, limit
            );
            if (moves[0] === "terminated") {
                return [["terminated"], 0];
            }
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
        for (const [move, branchBoard] of sortMoves(nextBoards, previousPath)) {
            const branchMap = branchBoard.pieces;
            let stop = 1;
            if (futility) {
                if (branchMap.size - 0 === size) {
                    stop = 0;
                } else {
                     //if theres a last min capture, then stop because we need to always let the opponent respond
                }
            }
            const [moves, evaluation] = miniMax(
                branchBoard,      (depth-1)*stop,   futile,
                alpha,            beta,
                PieceColor.WHITE, currentPath, previousPath,
                nextKing,         kingKey, start, limit
            );
            if (moves[0] === "terminated") {
                return [["terminated"], 0];
            }
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

export function sortMoves(boardMap: BoardMap, previousPath: string[]) {
    let moveNBoard: [string, Board][] = [...boardMap.entries()];
    const direction = (moveNBoard[0][1].attributes[0]) ? 1 : -1; 
    moveNBoard = moveNBoard.sort((a, b) => sortByEval(a[1], b[1], direction))
    //moveNBoard = moveNBoard.sort((a, b) => goCenter(a[0]) - goCenter(b[0]));
    let priority: [string, number][] = [
        //["1", -1], ["8", -1], ["7", -1], ["2", -1], 
        //these ranks are on the end, they can be considered last
        //["g", 1], ["b", 1], ["c", 1], 
        //these files are not that good, but not the worst
        //["Q", -1], ["R", 1], ["B", 1], ["N", 1], 
        //these prioritize pieces over pawns
        //["4", 1], ["5", 1], 
        //look for moving into the center ranks
        //["d", 1], ["e", 1], 
        //favor movement in the center files
        //["h",-1], ["a",-1], ["f",-1], 
        //the edges and moving the pawn in front of the king is the worst
        ["K",-1], ["O", 1], 
        //make king moves last except castling
        ["+", 1], 
        //make checks second most important
        ["x", 1], ["=", 1], 
        //prioritize captures and promotion
    ]
    for (let move of previousPath.reverse()) {
        priority.push([move, 1])
    }
    previousPath.reverse();
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

function sortByEval(a: Board, b: Board, direction: number) {
    return -direction * (evaluate(a.pieces) - evaluate(b.pieces));
}

function goCenter(move: string) {
    const ranks = move.match(/(\d)/);
    if (ranks?.length !== 2) {
        return 10;
    }
    return -Math.abs(4.5 - Number(ranks![1])) + Math.abs(Number(ranks![0]) - Number(ranks![1]))**3//Math.abs(4.5 - Number(ranks![0])) + Math.abs(4.5 - Number(ranks![1])); //- Math.abs(Number(ranks![1]) - 4.5)**(0.5);
}
/*

find the best move at each depth
one it is found let the next iteration use that key to find the 




*/
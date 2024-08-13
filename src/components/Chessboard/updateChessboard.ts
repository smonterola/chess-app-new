import { PieceColor, PieceType } from "../../Constants";
import { Board, Piece, PieceMap, Position } from "../../models";
import { findKingKey, isCheck } from "../../rules";
import { deepClone } from "../../rules/Clone";

//consider making this a class
export function updateBoard(
    board: Board, 
    p0: Position, 
    p1: Position, 
    kW: string,
    kB: string,
): [string, Board, boolean] {  //return if a capture or promotion happened and the board. Cannot check if mate/stalemate/check just yet
    const pieceMap: PieceMap = deepClone(board.pieces);
    const [turn0, wS0, wL0, bS0, bL0, enPassant0, prevHalfMoves, prevMoveCount] = board.attributes;
    if (!pieceMap.has(p0.string)) {
        console.log(pieceMap)
        console.log(board)
    }
    let piece: Piece = pieceMap.get(p0.string)!.clone;
    piece.position = p1;
    if (
        (piece.color === PieceColor.WHITE && turn0 !== 1) || 
        (piece.color === PieceColor.BLACK && turn0 !== 0) 
    ){
        console.clear();
        console.log("big error");
        return ["", new Board(new Map(), []), false]; //this should never happen
    }

    /* prepare the constants to be returned to classify the move */
    let didEnPassant: boolean = false;
    let [capture, promotion] = ["", ""];
    let shift: number = 0; //this defaults to no castling took place. 1 means short castle, -1 means long castle
    let turn1 = turn0 ^ 1;
    let enPassant1 = 15;
    let [wS1, wL1, bS1, bL1, halfMoves, moveCount] = [wS0, wL0, bS0, bL0, prevHalfMoves, prevMoveCount];

    if (pieceMap.has(p1.string)) {
        capture = pieceMap.has(p1.string) ? "x" : capture;
        halfMoves = -1;
        const target = pieceMap.get(p1.string)!;
        if (target.type === PieceType.ROOK) {
            const topRight = new Position(7,7);
            const topLeft = new Position(0,7);
            const bottomRight = new Position(0,0);
            const bottomLeft = new Position(7, 0);
            if (target.position.samePosition(topRight)) {
                bS1 = 0;
            } else if (target.position.samePosition(topLeft)) {
                bL1 = 0;
            } else if (target.position.samePosition(bottomRight)) {
                wS1 = 0;
            } else if (target.position.samePosition(bottomLeft)) {
                wL1 = 0;
            }
        }
    }
    /* DELETING THE PIECE */
    pieceMap.delete(p0.string);

    /* PAWN LOGIC - Promotion, setting enPassant, and taking enPassant */
    if (piece.type === PieceType.PAWN) {
        halfMoves = -1;
        if (canPromote(piece)) {
            const promotionType: PieceType = PieceType.QUEN;
            piece = promotePawn(piece, promotionType);
            promotion = "=" + promotionType;
        } else if (Math.abs(p1.y - p0.y) === 2) {
            enPassant1 = p1.x;
        }
        else if (p1.x - p0.x === 0) {
            //pass - make the code faster if a capture did not take place - short circuit evaluation
        } /* if the pawn is to move diagonally but a piece is not there, then it must deleted the pawn on the en passant square as long as pawn logic is true */
        else if (!p1.isOccupied(pieceMap)) {
            pieceMap.delete(new Position(enPassant0, p0.y).string);
            capture = "x";
            didEnPassant = true;
        }
    } else if (piece.type === PieceType.KING && Math.abs(p1.x - p0.x) === 2) {
        shift = Math.sign(p1.x - p0.x);
        const rookX = shift === 1 ? 7 : 0; 
        /* moving the rook */
        const rook: Piece = pieceMap.get(new Position(rookX, p0.y).string)!;
        pieceMap.delete(rook.position.string);
        rook.position.x = p1.x - shift; //actual movement is here
        pieceMap.set(rook.position.string, rook); //moving its location in the dictionary
    }
    /* NOW TO UPDATE CASTLING LOGIC */
    if ((turn0) && (wS0 || wL0)) {
        if (piece.type === PieceType.KING) {
            [wS1, wL1] = [0, 0];
        } else if (piece.type === PieceType.ROOK) {
            if (p0.x === 7) {
                wS1 = 0;
            } else if (p0.x === 0) {
                wL1 = 0;
            }
        }
    } else if (!(turn0) && (bS0 || bL0)) {
        if (piece.type === PieceType.KING) {
            [bS1, bL1] = [0, 0];
        } else if (piece.type === PieceType.ROOK) {
            if (p0.x === 7) {
                bS1 = 0;
            } else if (p0.x === 0) {
                bL1 = 0;
            }
        }
    }

    /* FINALLY MOVING THE PIECE AFTER ALL THE LOGIC HAS BEEN COMPLETE */
    piece.position = p1.clone;
    pieceMap.set(p1.string, piece);

    /* CHECKING IF THE OTHER KING IS IN CHECK */
    const [starterString, color1] : [string, PieceColor] = (turn1 === 1) ? [kW, PieceColor.WHITE] : [kB, PieceColor.BLACK];
    const enemyKing: Piece = pieceMap.get(findKingKey(pieceMap, starterString, color1))!;
    const checkMove: string = isCheck(pieceMap, enemyKing.position, color1) ? "+" : "";

    // checks, captures, mate, en passant, castling, stalemate
    // how to know if check, use the function I made, maybe pass king string to make it easier to find it
        //if they are in check, then also check if it is mate.
            //check if they have legal moves, use the status funciton. Have update piece map pass in strings to both kings
    // find the old piece. If it does not exist then no capture
        // dont forget to check en passant
    // if there was a piece there, check what it was. Use a to be built function that compares the difference it material.
        // the rating of the captures will be sorted by the result of the function
    // if there are ever any ties, always check specific order of pieces
        // look at king last, figure out and order of the other pieces too
    
    let action: string = `${piece.type}${p0.string}${capture}${p1.string}${promotion}`;
    //console.log(capture)
    if (shift === 1) {
        action = "O-O";
    } else if (shift === -1) {
        action = "O-O-O";
    }

    const newAttributes: number[] = [turn1, wS1, wL1, bS1, bL1, enPassant1, halfMoves+1, moveCount+turn0]
    const updatedBoard = new Board(pieceMap, newAttributes);

    return [action + checkMove, updatedBoard, didEnPassant];
}

export function canPromote(piece: Piece) {
    return (
        piece.type === PieceType.PAWN && 
        (piece.position.y === 0 || piece.position.y === 7)
    );
}
export function promotePawn(
    pawn: Piece,
    promotionType: PieceType,
){
    const newPiece: Piece = new Piece(pawn.position, promotionType, pawn.color);
    return newPiece;
}
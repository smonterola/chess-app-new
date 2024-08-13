import { PieceColor, PieceType, xAxis } from "../Constants";
import { Board, PieceMap, Position } from "../models";
import { Piece } from "../models";

export function boardToFen(board: Board): string {
    const pieceMap = board.pieces;
    let fen: string = "";
    for (let rank = 7; rank >= 0; rank--) {
        let emptySpaces = 0;
        for (let file = 0; file <= 7; file++) {
            const p: Position = new Position(file, rank);
            if (!pieceMap.has(p.string)) {
                emptySpaces++;
            } else {
                if (emptySpaces > 0) {
                    fen += `${emptySpaces}`;
                    emptySpaces = 0;
                }
                const piece: Piece = pieceMap.get(p.string)!;
                fen += pieceFen(piece.type, piece.color);
            }
        }
        if (emptySpaces > 0) {
            fen += `${emptySpaces}`;
        }
        if (rank > 0) fen += "/";
    }
    const attributes = board.attributes;
    const color: string = (attributes[0]) ? "w" : "b";
    const wS: string = (attributes[1]) ? "K" : "";
    const wL: string = (attributes[2]) ? "Q" : "";
    const bS: string = (attributes[3]) ? "k" : "";
    const bL: string = (attributes[4]) ? "q" : "";
    let castling = wS + wL + bS + bL;
    if (castling === "") {
        castling = "-";
    }
    const enPassantFile: number = attributes[5];
    let enPassant: string = "-";
    if (enPassantFile !== 15) {
        const rank: number = (color !== "w") ? 3 : 6;
        enPassant = xAxis[enPassantFile] + `${rank}`;
    }
    return fen + " " + color + " " + castling + " " + enPassant + ` ${attributes[6]} ${attributes[7]}`;
}

export function fenToBoard(fen: string): Board {
    const [pieces, color, castling, enPassant, halfMoves, moveCount] = fen.split(" ", 6);
    const ranks: string[] = pieces.split("/", 8);
    const pieceMap: PieceMap = new Map();
    let y = 7;
    for (const rank of ranks) {
        let x = 0;
        for (const char of rank) {
            const increment: number = (char.match(/^[1-8]$/)) ? Number(char) : 0;
            if (increment) {
                x += increment;
            } else {
                const p: Position = new Position(x, y);
                pieceMap.set(p.string, fenPiece(char, p));
                x++;
            }
        }
        y--;
    }
    const attributes: number[] = [
        color === "w" ? 1 : 0,
        castling.match('K') ? 1 : 0,
        castling.match('Q') ? 1 : 0,
        castling.match('k') ? 1 : 0,
        castling.match('q') ? 1 : 0,
        enPassant === "-" ? 15 : xAxis.indexOf(enPassant[0]),
        Number(halfMoves), 
        Number(moveCount),
    ];
    return new Board(pieceMap, attributes);
}

function pieceFen(type: PieceType, color: PieceColor): string {
    const char: string = type === PieceType.PAWN ? "P" : `${type}`;
    return color === PieceColor.WHITE ? char : char.toLowerCase();
}

function fenPiece(char: string, position: Position): Piece {
    const typeCode: Map<string, PieceType> = new Map([
        ["P", PieceType.PAWN],
        ["N", PieceType.NGHT],
        ["B", PieceType.BSHP],
        ["R", PieceType.ROOK],
        ["Q", PieceType.QUEN],
        ["K", PieceType.KING],
    ]); 
    return new Piece(
        position, 
        typeCode.get(char.toUpperCase())!, 
        (char.toUpperCase() === char) ? 
            PieceColor.WHITE : PieceColor.BLACK
    );
}

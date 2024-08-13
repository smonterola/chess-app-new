import { Position } from "../../models";
import { PieceType } from "../../Constants";

export const rawPawnDirections: Position[] = [
    new Position(-1, 1),
    new Position( 1, 1),
    new Position( 0, 1),
    new Position( 0, 2),
    new Position(-1, 0),
    new Position( 1, 0),
];

export const rookDirections: Position[] = [
    new Position( 1, 0), // 0pi/2
    new Position( 0, 1), // 1pi/2
    new Position(-1, 0), // 2pi/2
    new Position( 0,-1), // 3pi/2
];

export const bishopDirections: Position[] = [
    new Position( 1, 1), //  pi/4
    new Position( 1,-1), // 3pi/4
    new Position(-1,-1), // 5pi/4
    new Position(-1, 1), // 7pi/4
];

const knightDirections: Position[] = [
    new Position( 2, 1),
    new Position( 2,-1),
    new Position(-2,-1),
    new Position(-2, 1),
    new Position( 1, 2),
    new Position( 1,-2),
    new Position(-1,-2),
    new Position(-1, 2),
]

const queenDirections: Position[] = 
    rookDirections.concat(bishopDirections);

const pawnAttacks: Position[] = [
    new Position(-1, 1),
    new Position( 1, 1),
]

export const pieceDirectons = new Map<PieceType, [Position[], boolean]>([
    [PieceType.NGHT, [knightDirections, true]],
    [PieceType.BSHP, [bishopDirections, false]],
    [PieceType.ROOK, [rookDirections, false]],
    [PieceType.QUEN, [queenDirections, false]],
    [PieceType.KING, [queenDirections, true]],
    [PieceType.PAWN, [pawnAttacks, true]],
]);


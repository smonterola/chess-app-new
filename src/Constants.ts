export const yAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const xAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];

export enum PieceType {
    PAWN = "",
    NGHT = "N",
    BSHP = "B",
    ROOK = "R",
    QUEN = "Q",
    KING = "K",
}

export enum PieceColor {
    WHITE = "w",
    BLACK = "b",
}

export enum GameState {
    MIDDLEGAME = "Middlegame",
    THRESHOLD = "Threshold",
    ENDGAME = "Endgame",
    CHECKMATE = "Checkmate",
    STALEMATE = "Stalemate",
    CHECK = "Check",
    PLAY = "Play",
}

export function nextTurn(pieceColor: PieceColor): PieceColor {
    return (pieceColor === PieceColor.WHITE) ? PieceColor.BLACK : PieceColor.WHITE;
}

const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
const minDimPx = (vw < vh) ? vw : vh;
export const TILESIZE = minDimPx / 8;
document.documentElement.style.setProperty("--tileSize", `${TILESIZE}px`);


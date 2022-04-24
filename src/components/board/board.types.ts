import {Piece} from '../pieces/piece';

export interface BoardMove {
    from: number;
    to: number;
    enPassant: string;
    promotionChoice: PromotionChoice | undefined;
}

export interface MoveEntry {
    from: string;
    to: string;
    piece: Piece;
    capturedPiece?: Piece;
    boardVariables: BoardVariables;
    fenBoard: string;
}

export interface BoardVariables {
    stalemate: boolean;
    repetitionRule: boolean;
    halfMoveClockRule: boolean;
    whiteKingInCheck: boolean;
    whiteKingInCheckMate: boolean;
    blackKingInCheck: boolean;
    blackKingInCheckMate: boolean;
    whiteKingMoved: boolean;
    whiteKingRookMoved: boolean;
    whiteQueenRookMoved: boolean;
    blackKingMoved: boolean;
    blackKingRookMoved: boolean;
    blackQueenRookMoved: boolean;
    whiteCanCastleKingSide: boolean;
    blackCanCastleKingSide: boolean;
    whiteCanCastleQueenSide: boolean;
    blackCanCastleQueenSide: boolean;
    halfMoveClock: number;
    fullMovesNumber: number;
    enPassant: string;
}

export class EmptyTile {}

export type Tile = Piece | EmptyTile;

export type BoardType = [
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
    Tile, Tile, Tile, Tile, Tile, Tile, Tile, Tile,
];

export enum PromotionChoice {
    WhiteQueen = 'Q',
    WhiteRook = 'R',
    WhiteBishop = 'B',
    WhiteKnight = 'K',
    BlackQueen = 'q',
    BlackRook = 'r',
    BlackBishop = 'b',
    BlackKnight = 'k'
}

export enum Color {
    White = 'White',
    Black = 'Black'
}

export enum Cols {
    A = 'a',
    B = 'b',
    C = 'c',
    D = 'd',
    E = 'e',
    F = 'f',
    G = 'g',
    H = 'h'
}

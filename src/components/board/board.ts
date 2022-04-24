import {ChessEngine} from '../../chess-engine';
import {Piece} from '../pieces/piece';
import {Bishop} from '../pieces/bishop';
import {King} from '../pieces/king';
import {Knight} from '../pieces/knight';
import {Pawn} from '../pieces/pawn';
import {Queen} from '../pieces/queen';
import {Rook} from '../pieces/rook';
import {BoardMove, BoardType, BoardVariables, Color, EmptyTile, PromotionChoice, Tile} from './board.types';

export class Board {
    public static board: BoardType;

    public static boardVariables: BoardVariables;
    public activePieces: Array<Piece> = [];

    public constructor() {
        Board.board = this.initEmptyBoard();
        Board.setBoardVariables();
    }

    public getActivePieces(color?: Color): Array<Piece> {
        return !color ? this.activePieces : this.activePieces.filter((piece) => piece.color === color);
    }

    public getTiles(): BoardType {
        return Board.board;
    }

    public movePiece(boardMove: BoardMove): Piece | undefined {
        let piece = Board.board[boardMove.from];
        Board.boardVariables.halfMoveClock += 1;
        Board.boardVariables.enPassant = '-';
        let capturedPiece;
        if (!(Board.board[boardMove.to] instanceof EmptyTile)) {
            capturedPiece = Board.board[boardMove.to] as Piece;
            Board.boardVariables.halfMoveClock = 0;
        }
        if (piece instanceof Pawn) {
            Board.boardVariables.halfMoveClock = 0;
            if (boardMove.enPassant !== '-') {
                capturedPiece = this.captureEnPassantPawn(boardMove.to, boardMove.enPassant, piece);
            }
            if (boardMove.promotionChoice) {
                piece = this.getNewPiece(boardMove.promotionChoice) as Piece;
            }
        }
        Board.board[boardMove.from] = new EmptyTile();
        (piece as Piece).coord = ChessEngine.indexToCoord(boardMove.to);
        Board.board[boardMove.to] = piece;

        if (piece instanceof Rook) {
            this.setRookCastlingConditions(piece, boardMove.from);
        }
        if (piece instanceof King) {
            this.setCastlingMove(boardMove.from, boardMove.to);
            this.setKingCastlingConditions(piece);
        }

        return capturedPiece;
    }

    public placePiece(piece: string, coord: string): Piece | undefined {
        if (coord.length !== 2) {
            return undefined;
        }
        const newPiece = this.getNewPiece(piece);
        if (newPiece && ChessEngine.isValidCoord(coord)) {
            const i = ChessEngine.coordToIndex(coord);
            if (Board.board[i] instanceof EmptyTile) {
                newPiece.coord = coord;
                Board.board[i] = newPiece;
                return newPiece;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    private initEmptyBoard(): BoardType {
        return [
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(),
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(),
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(),
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(),
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(),
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(),
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(),
            new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile(), new EmptyTile()
        ];
    }

    private getNewPiece(piece: string): Piece | undefined {
        let newPiece: Piece;
        switch (piece) {
            case 'Q':
                newPiece = new Queen(Color.White, '');
                break;
            case 'q':
                newPiece = new Queen(Color.Black, '');
                break;
            case 'N':
                newPiece = new Knight(Color.White, '');
                break;
            case 'n':
                newPiece = new Knight(Color.Black, '');
                break;
            case 'B':
                newPiece = new Bishop(Color.White, '');
                break;
            case 'b':
                newPiece = new Bishop(Color.Black, '');
                break;
            case 'R':
                newPiece = new Rook(Color.White, '');
                break;
            case 'r':
                newPiece = new Rook(Color.Black, '');
                break;
            case 'K':
                newPiece = new King(Color.White, '');
                break;
            case 'k':
                newPiece = new King(Color.Black, '');
                break;
            case 'P':
                newPiece = new Pawn(Color.White, '');
                break;
            case 'p':
                newPiece = new Pawn(Color.Black, '');
                break;
            default:
                return undefined;
        }
        return newPiece;
    }

    private captureEnPassantPawn(to: number, enPassant: string, piece: Pawn): Piece | undefined {
        let capturedPiece;
        if (to === ChessEngine.coordToIndex(enPassant)) {
            const enPassantTargetCoord = piece.color === Color.White ? enPassant[0] + '7' : enPassant[0] + '4';
            const capturedPawnIndex = ChessEngine.coordToIndex(enPassantTargetCoord);
            capturedPiece = Board.board[capturedPawnIndex] as Piece;
            Board.board[ChessEngine.coordToIndex(enPassantTargetCoord)] = new EmptyTile();
            Board.boardVariables.enPassant = enPassant;
        }
        return capturedPiece;
    }

    private setRookCastlingConditions(piece: EmptyTile, from: number): void {
        if ((piece as Rook).color === Color.White) {
            if (from === 7) {
                Board.boardVariables.whiteCanCastleKingSide = false;
                Board.boardVariables.whiteKingRookMoved = true;
            }
            if (from === 0) {
                Board.boardVariables.whiteCanCastleQueenSide = false;
                Board.boardVariables.whiteQueenRookMoved = true;
            }
        }
        if ((piece as Rook).color === Color.Black) {
            if (from === 63) {
                Board.boardVariables.blackCanCastleKingSide = false;
                Board.boardVariables.blackKingRookMoved = true;
            }
            if (from === 56) {
                Board.boardVariables.blackCanCastleQueenSide = false;
                Board.boardVariables.blackQueenRookMoved = true;
            }
        }
    }

    private setCastlingMove(from: number, to: number): void {
        if (from === 4 && to === 6) {
            Board.board[5] = Board.board[7];
            Board.board[7] = new EmptyTile();
            Board.boardVariables.whiteKingRookMoved = true;
        } else if (from === 60 && to === 62) {
            Board.board[61] = Board.board[63];
            Board.board[63] = new EmptyTile();
            Board.boardVariables.blackKingRookMoved = true;
        } else if (from === 4 && to === 2) {
            Board.board[3] = Board.board[0];
            Board.board[0] = new EmptyTile();
            Board.boardVariables.whiteQueenRookMoved = true;
        } else if (from === 60 && to === 58) {
            Board.board[59] = Board.board[56];
            Board.board[56] = new EmptyTile();
            Board.boardVariables.blackQueenRookMoved = true;
        }
    }

    private setKingCastlingConditions(piece: EmptyTile): void {
        if ((piece as King).color === Color.White) {
            Board.boardVariables.whiteCanCastleKingSide = false;
            Board.boardVariables.whiteCanCastleQueenSide = false;
            Board.boardVariables.whiteKingMoved = true;
        }
        if ((piece as King).color === Color.Black) {
            Board.boardVariables.blackCanCastleKingSide = false;
            Board.boardVariables.blackCanCastleQueenSide = false;
            Board.boardVariables.blackKingMoved = true;
        }
    }

    public static setBoardVariables(): void {
        Board.boardVariables = {
            stalemate: false,
            repetitionRule: false,
            halfMoveClockRule: false,
            whiteKingInCheck: false,
            whiteKingInCheckMate: false,
            blackKingInCheck: false,
            blackKingInCheckMate: false,
            whiteKingMoved: false,
            whiteKingRookMoved: false,
            whiteQueenRookMoved: false,
            blackKingMoved: false,
            blackKingRookMoved: false,
            blackQueenRookMoved: false,
            whiteCanCastleKingSide: true,
            blackCanCastleKingSide: true,
            whiteCanCastleQueenSide: true,
            blackCanCastleQueenSide: true,
            halfMoveClock: 0,
            fullMovesNumber: 1,
            enPassant: '-'
        };
    }

    public static planeCoords(coord: string): Array<number> {
        const x = coord.charCodeAt(0) + 1 - ChessEngine.ASCII_OFFSET;
        const y = parseInt(coord.charAt(1), 10);
        return [x, y];
    }

    public static stringCoord(x: number, y: number): string {
        const col = String.fromCharCode(x - 1 + ChessEngine.ASCII_OFFSET);
        const row = y.toString();
        return col + row;
    }

    public static getTile(coord: string): Tile | undefined {
        if (ChessEngine.isValidCoord(coord)) {
            return this.board[ChessEngine.coordToIndex(coord)];
        } else {
            return undefined;
        }
    }
}

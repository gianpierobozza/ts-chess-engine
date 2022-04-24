import {Board} from '../board/board';
import {Color, EmptyTile} from '../board/board.types';
import {Piece} from './piece';
import {Rook} from './rook';

export class King implements Piece {
    public color: Color;
    public coord: string;

    constructor(color: Color, coord: string) {
        this.color = color;
        this.coord = coord;
    }

    public str(): string {
        return this.color === Color.White ? 'K' : 'k';
    }

    public validMoves(controlledTiles: Array<string>): Array<string> {
        const validMovesCoords: Array<string> = [];

        const [x, y] = Board.planeCoords(this.coord);
        if (x + 1 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 1, y), validMovesCoords);
        }
        if (x + 1 <= 8 && y + 1 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 1, y + 1), validMovesCoords);
        }
        if (y + 1 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x, y + 1), validMovesCoords);
        }
        if (x - 1 >= 1 && y + 1 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 1, y + 1), validMovesCoords);
        }
        if (x - 1 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 1, y), validMovesCoords);
        }
        if (x - 1 >= 1 && y - 1 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x - 1, y - 1), validMovesCoords);
        }
        if (y - 1 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x, y - 1), validMovesCoords);
        }
        if (x + 1 <= 8 && y - 1 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x + 1, y - 1), validMovesCoords);
        }
        this.pushIfValidKingSideCastle(controlledTiles, validMovesCoords);
        this.pushIfValidQueenSideCastle(controlledTiles, validMovesCoords);

        return validMovesCoords;
    }

    private pushIfValidKingSideCastle(controlledTiles: Array<string>, validMovesCoords: Array<string>): void {
        if (this.color === Color.White && Board.boardVariables.whiteCanCastleKingSide) {
            if (!controlledTiles.includes('e1') && !controlledTiles.includes('f1') && !controlledTiles.includes('g1')) {
                if (Board.getTile('e1') instanceof King && Board.getTile('f1') instanceof EmptyTile &&
                    Board.getTile('g1') instanceof EmptyTile && Board.getTile('h1') instanceof Rook) {
                    validMovesCoords.push('g1');
                }
            }
        }
        if (this.color === Color.Black && Board.boardVariables.blackCanCastleKingSide) {
            if (!controlledTiles.includes('e8') && !controlledTiles.includes('f8') && !controlledTiles.includes('g8')) {
                if (Board.getTile('e8') instanceof King && Board.getTile('f8') instanceof EmptyTile &&
                    Board.getTile('g8') instanceof EmptyTile && Board.getTile('h8') instanceof Rook) {
                    validMovesCoords.push('g8');
                }
            }
        }
    }

    private pushIfValidQueenSideCastle(controlledTiles: Array<string>, validMovesCoords: Array<string>): void {
        if (this.color === Color.White && Board.boardVariables.whiteCanCastleQueenSide) {
            if (!controlledTiles.includes('e1') && !controlledTiles.includes('d1') && !controlledTiles.includes('c1')) {
                if (Board.getTile('e1') instanceof King && Board.getTile('d1') instanceof EmptyTile && Board.getTile('c1') instanceof EmptyTile &&
                    Board.getTile('b1') instanceof EmptyTile && Board.getTile('a1') instanceof Rook) {
                    validMovesCoords.push('c1');
                }
            }
        }
        if (this.color === Color.Black && Board.boardVariables.blackCanCastleQueenSide) {
            if (!controlledTiles.includes('e8') && !controlledTiles.includes('d8') && !controlledTiles.includes('c8')) {
                if (Board.getTile('e8') instanceof King && Board.getTile('d8') instanceof EmptyTile && Board.getTile('c8') instanceof EmptyTile &&
                    Board.getTile('b8') instanceof EmptyTile && Board.getTile('a8') instanceof Rook) {
                    validMovesCoords.push('c8');
                }
            }
        }
    }

    private pushIfValidLandingTile(coord: string, validMovesCoords: Array<string>): void {
        if (Board.getTile(coord) instanceof EmptyTile || (Board.getTile(coord) as Piece).color !== this.color) {
            validMovesCoords.push(coord);
        }
    }
}

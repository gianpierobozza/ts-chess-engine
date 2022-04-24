import {Board} from '../board/board';
import {Color, EmptyTile} from '../board/board.types';
import {Piece} from './piece';

export class Pawn implements Piece {
    public color: Color;
    public coord: string;

    constructor(color: Color, coord: string) {
        this.color = color;
        this.coord = coord;
    }

    public str(): string {
        return this.color === Color.White ? 'P' : 'p';
    }

    public validMoves(controlledTiles: Array<string>, enPassant: string): Array<string> {
        const validMovesCoords: Array<string> = [];
        const validCaptureCoords: Array<string> = [];

        const [x, y] = Board.planeCoords(this.coord);
        this.fillValidMovesArray(y, x, validMovesCoords);
        this.fillValidCaptureArray(x, y, validCaptureCoords, false, enPassant);

        return validMovesCoords.concat(validCaptureCoords);
    }

    public validCaptures(enPassant: string): Array<string> {
        const validCaptureCoords: Array<string> = [];

        const [x, y] = Board.planeCoords(this.coord);
        this.fillValidCaptureArray(x, y, validCaptureCoords, true, enPassant);

        return validCaptureCoords;
    }

    private fillValidMovesArray(y: number, x: number, validMovesCoords: Array<string>): void {
        if (this.color === Color.White && y + 1 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x, y + 1), validMovesCoords);
        }
        if (this.color === Color.White && y === 2 && y + 2 <= 8) {
            this.pushIfValidLandingTile(Board.stringCoord(x, y + 2), validMovesCoords);
        }
        if (this.color === Color.Black && y - 1 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x, y - 1), validMovesCoords);
        }
        if (this.color === Color.Black && y === 7 && y - 2 >= 1) {
            this.pushIfValidLandingTile(Board.stringCoord(x, y - 2), validMovesCoords);
        }
    }

    private pushIfValidLandingTile(coord: string, validMovesCoords: Array<string>): void {
        if (Board.getTile(coord) instanceof EmptyTile) {
            validMovesCoords.push(coord);
        }
    }

    private fillValidCaptureArray(x: number, y: number, validCaptureCoords: Array<string>, controllingCalculation: boolean, enPassant: string): void {
        if (this.color === Color.White && x - 1 >= 1 && y + 1 <= 8) {
            this.pushIfPawnCanCaputure(Board.stringCoord(x - 1, y + 1), validCaptureCoords, controllingCalculation, enPassant);
        }
        if (this.color === Color.White && x + 1 <= 8 && y + 1 <= 8) {
            this.pushIfPawnCanCaputure(Board.stringCoord(x + 1, y + 1), validCaptureCoords, controllingCalculation, enPassant);
        }
        if (this.color === Color.Black && x - 1 >= 1 && y - 1 <= 8) {
            this.pushIfPawnCanCaputure(Board.stringCoord(x - 1, y - 1), validCaptureCoords, controllingCalculation, enPassant);
        }
        if (this.color === Color.Black && x + 1 <= 8 && y - 1 <= 8) {
            this.pushIfPawnCanCaputure(Board.stringCoord(x + 1, y - 1), validCaptureCoords, controllingCalculation, enPassant);
        }
    }

    private pushIfPawnCanCaputure(coord: string, validMovesCoords: Array<string>, controllingCalculation: boolean, enPassant: string): void {
        if ((!(Board.getTile(coord) instanceof EmptyTile) || controllingCalculation || coord === enPassant) && (Board.getTile(coord) as Piece).color !== this.color) {
            validMovesCoords.push(coord);
        }
    }
}

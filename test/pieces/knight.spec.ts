import {expect} from 'chai';
import {ChessEngine} from '../../src/chess-engine';
import {Board} from '../../src/components/board/board';
import {Color} from '../../src/components/board/board.types';
import {Knight} from '../../src/components/pieces/knight';

describe('Knight', () => {
    describe('when asking to create a new piece', () => {
        it('should be of the right class and have all the properties', () => {
            const whiteKnight = new Knight(Color.White, 'b1');

            expect(whiteKnight.constructor.name).to.be.equal('Knight');
            expect(whiteKnight.color).to.be.equal(Color.White);
            expect(whiteKnight.coord).to.be.equal('b1');
        });
    });

    describe('when asking to move the piece', () => {
        it('should have valid landing tiles in an L shaped trajectory', () => {
            const chess = new ChessEngine();
            chess.placePiece('N', 'd5');
            const whiteKnight = Board.board[ChessEngine.coordToIndex('d5')] as Knight;

            const expectedValidMoves = ['c7', 'e7', 'f6', 'f4', 'e3', 'c3', 'b4', 'b6'];
            const validMoves = whiteKnight.validMoves();

            expect(expectedValidMoves).to.have.all.members(validMoves);
        });
    });
});

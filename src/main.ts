import {ChessEngine} from './chess-engine';
import {PromotionChoice} from './components/board/board.types';

const chess = new ChessEngine();
chess.setUpBoard();
console.log(chess.ascii());

// test stalemate
chess.setBoardFromFEN('8/6p1/5p2/5P1K/4k2P/8/8/8 b - - 0 1');
console.log(chess.ascii());
console.log(chess.getFEN());
chess.makeMove({from: 'e4', to: 'f5'});
console.log(chess.ascii());
console.log(`Game status: ${chess.isGameOver()}`);
console.log(chess.getFEN());

// test pawn promotion
// chess.setBoardFromFEN('4k2r/8/8/8/8/8/p7/4K2R b Kk - 0 1');
// chess.makeMove({from: 'a2', to: 'a1', promotionChoice: PromotionChoice.BlackQueen});
// console.log(chess.ascii());
// console.log(chess.getFEN());
// chess.undoLastHalfMove();
// console.log(chess.ascii());
// console.log(chess.getFEN());

// test repetition rule draw
// chess.makeMove({from: 'g1', to: 'f3'});
// chess.makeMove({from: 'g8', to: 'f6'});
// chess.makeMove({from: 'f3', to: 'g1'});
// chess.makeMove({from: 'f6', to: 'g8'});
// chess.makeMove({from: 'g1', to: 'f3'});
// chess.makeMove({from: 'g8', to: 'f6'});
// chess.makeMove({from: 'f3', to: 'g1'});
// chess.makeMove({from: 'f6', to: 'g8'});
// console.log(chess.ascii());
// console.log(chess.isGameOver());

// test for checkmate
// chess.setBoardFromFEN('6k1/1R6/R7/8/8/2r5/8/5K2 w - - 0 1');
// console.log(chess.ascii());
// console.log(chess.getFEN());
// chess.makeMove({from: 'a6', to: 'a8'});
// console.log(chess.ascii());
// console.log(chess.getFEN());
// chess.makeMove({from: 'c3', to: 'c8'});
// console.log(`Game status: ${chess.isGameOver()}`);
// console.log(chess.ascii());
// console.log(chess.getFEN());
// chess.makeMove({from: 'a8', to: 'c8'});
// console.log(`Game status: ${chess.isGameOver()}`);
// console.log(chess.ascii());
// console.log(chess.getFEN());

// test castling
// chess.makeMove({from: 'e2', to: 'e4'});
// console.log(chess.ascii());
// console.log(chess.getFEN());
// chess.makeMove({from: 'e7', to: 'e5'});
// console.log(chess.ascii());
// console.log(chess.getFEN());
// chess.makeMove({from: 'g1', to: 'f3'});
// chess.makeMove({from: 'g8', to: 'f6'});
// chess.makeMove({from: 'f1', to: 'd3'});
// chess.makeMove({from: 'f8', to: 'd6'});
// chess.makeMove({from: 'f3', to: 'g5'});
// chess.makeMove({from: 'f6', to: 'g4'});
// chess.makeMove({from: 'd1', to: 'e2'});
// chess.makeMove({from: 'd8', to: 'e7'});
// chess.makeMove({from: 'b2', to: 'b3'});
// chess.makeMove({from: 'b7', to: 'b6'});
// chess.makeMove({from: 'c1', to: 'a3'});
// chess.makeMove({from: 'c8', to: 'a6'});
// chess.makeMove({from: 'b1', to: 'c3'});
// chess.makeMove({from: 'b8', to: 'c6'});
// chess.makeMove({from: 'g5', to: 'e6'});
// chess.makeMove({from: 'g4', to: 'e3'});
// console.log(chess.ascii());
// chess.makeMove({from: 'e6', to: 'g5'});
// chess.makeMove({from: 'e3', to: 'g4'});
// console.log(chess.ascii());
// console.log(chess.getFEN());

// chess.makeMove({from: 'e1', to: 'c1'});
// console.log(chess.ascii());

// chess.makeMove({from: 'e8', to: 'c8'});
// console.log(chess.ascii());
// console.log(chess.getFEN());

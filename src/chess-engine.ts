import {Board} from './components/board/board';
import {Color, Cols, EmptyTile, MoveEntry, PromotionChoice, Tile} from './components/board/board.types';
import {Piece} from './components/pieces/piece';
import {King} from './components/pieces/king';
import {Pawn} from './components/pieces/pawn';
import {Rook} from './components/pieces/rook';
import {GameState, GameMove} from './chess-engine.types';

export class ChessEngine {
    public static ASCII_OFFSET = 97;
    private INITIAL_BOARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    private INITIAL_FULL_FEN = this.INITIAL_BOARD_FEN + ' w KQkq - 0 1';

    private board: Board;

    public nextToMove: Color = Color.White;
    public whiteControlledTiles: Array<string> = [];
    public blackControlledTiles: Array<string> = [];
    public movesList: Array<MoveEntry> = [];
    public undoMovesStack: Array<MoveEntry> = [];

    public constructor() {
        this.board = new Board();
    }

    public isGameOver(): GameState {
        if (Board.boardVariables.blackKingInCheckMate) {
            return GameState.WhiteWins;
        }
        if (Board.boardVariables.whiteKingInCheckMate) {
            return GameState.BlackWins;
        }
        if (Board.boardVariables.stalemate ||
            Board.boardVariables.repetitionRule ||
            Board.boardVariables.halfMoveClockRule) {
            return GameState.Draw;
        }
        return GameState.InProgress;
    }

    public makeMove(gameMove: GameMove): boolean {
        if (Board.boardVariables.blackKingInCheckMate ||
            Board.boardVariables.whiteKingInCheckMate ||
            Board.boardVariables.stalemate ||
            Board.boardVariables.repetitionRule ||
            Board.boardVariables.halfMoveClockRule) {
            return false;
        }
        if (ChessEngine.isValidCoord(gameMove.from) && ChessEngine.isValidCoord(gameMove.to)) {
            const piece = Board.getTile(gameMove.from);
            if (piece && this.isNotEmptyTileAndNextColorToMove(piece)) {
                const oppositeSideControlledTiles = this.getOppositeSideControlledTilesBasedOnColor((piece as Piece).color);
                if (this.isValidMove(piece as Piece, oppositeSideControlledTiles, gameMove.to, gameMove.promotionChoice)) {
                    const boardVariables = {...Board.boardVariables};
                    const capturedPiece = this.board.movePiece({
                        from: ChessEngine.coordToIndex(gameMove.from),
                        to: ChessEngine.coordToIndex(gameMove.to),
                        enPassant: this.getEnPassantTargetTileFEN().trim(),
                        promotionChoice: gameMove.promotionChoice
                    });
                    if (gameMove.promotionChoice && piece instanceof Pawn) {
                        this.board.activePieces = this.board.activePieces.filter((active) => active !== piece);
                        this.board.activePieces.push(Board.board[ChessEngine.coordToIndex(gameMove.to)] as Piece);
                    }
                    this.updateActivePiecesIfCapture(capturedPiece);
                    this.updateControlledTiles();
                    this.determineIfOppositeKingIsInCheck(piece as Piece, oppositeSideControlledTiles);
                    this.determineIfSameSideKingIsInCheck(
                        (piece as Piece).color,
                        this.getOppositeSideControlledTilesBasedOnColor((piece as Piece).color)
                    );
                    this.determineCastlingRights();
                    this.movesList.push({
                        from: gameMove.from,
                        to: gameMove.to,
                        piece: piece as Piece,
                        capturedPiece,
                        boardVariables,
                        fenBoard: this.getBoardPiecesInFEN().trim()
                    });
                    this.nextToMove = this.nextToMove === Color.White ? Color.Black : Color.White;
                    this.increaseFullMovesNumber();
                    if (!gameMove.pseudoMove && this.isKingInCheckBasedOnColor((piece as Piece).color)) {
                        this.undoLastHalfMove(true);
                        return false;
                    }
                    if (!gameMove.pseudoMove && this.isKingInCheckBasedOnColor(this.nextToMove) && this.isKingInCheckmateBasedOnColor(this.nextToMove)) {
                        if (this.nextToMove === Color.White) {
                            Board.boardVariables.whiteKingInCheckMate = true;
                            this.movesList[this.movesList.length - 1].boardVariables.whiteKingInCheckMate = true;
                        } else {
                            Board.boardVariables.blackKingInCheckMate = true;
                            this.movesList[this.movesList.length - 1].boardVariables.blackKingInCheckMate = true;
                        }
                        return false;
                    }
                    if (!gameMove.pseudoMove) {
                        this.determineDraw();
                    }
                    if (!gameMove.redoMove) {
                        this.undoMovesStack = [];
                    }
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    public placePiece(piece: string, coord: string): boolean {
        const newPiece = this.board.placePiece(piece, coord);
        if (newPiece) {
            this.board.activePieces.push(newPiece);
            return true;
        }
        return false;
    }

    public getActivePieces(color?: Color): Array<Piece> {
        return this.board.getActivePieces(color);
    }

    public undoLastHalfMove(cancel?: boolean): void {
        const lastHalfMove = this.movesList.pop();
        if (lastHalfMove) {
            this.revertPiecesOnBoard(lastHalfMove);
            Board.boardVariables = {...lastHalfMove.boardVariables};
            this.undoCastlingRooksIfNeeded(lastHalfMove);
            this.updateControlledTiles();
            this.determineCastlingRights();
            this.nextToMove = this.nextToMove === Color.White ? Color.Black : Color.White;
            if (!cancel) {
                this.undoMovesStack.push(lastHalfMove);
            }
        }
    }

    public redoHalfMove(): void {
        const halfMove = this.undoMovesStack.pop();
        if (halfMove) {
            this.makeMove({
                from: halfMove.from,
                to: halfMove.to,
                promotionChoice: undefined,
                redoMove: true
            });
        }
    }

    public ascii(): string {
        let asciiBoard = '';
        const board = this.board.getTiles();
        for (let y = 0; y < 8; y++) {
            let out = `  ${y + 1}  |`;
            for (let x = 0; x < 8; x++) {
                const piece = board[(y * 8) + x];
                if (!(piece instanceof EmptyTile)) {
                    out += ` ${piece.str()}`;
                } else {
                    out += ' .';
                }
            }
            out += ' |\n';
            asciiBoard = out + asciiBoard;
        }
        asciiBoard = '      _________________\n' + asciiBoard;
        asciiBoard = asciiBoard + '      ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\n';
        asciiBoard = asciiBoard + '       a b c d e f g h \n';
        return asciiBoard;
    }

    public getFEN(): string {
        let fen = '';

        fen += this.getBoardPiecesInFEN();
        fen += this.getNextToMoveFEN();
        fen += this.getCastlingRightsFEN();
        fen += this.getEnPassantTargetTileFEN();
        fen += this.getHalfMoveClockFEN();
        fen += this.getFullMovesNumberFEN();

        return fen;
    }

    public setBoardFromFEN(fen: string): void {
        this.emptyBoard();
        const [board, nextToMove, castlingRights, enPassant, halfMoveClock, fullMovesNumber] = fen.split(' ');
        this.setPiecesFEN(board);
        this.nextToMove = nextToMove === 'w' ? Color.White : Color.Black;
        this.setCastlingRightsFEN(castlingRights);
        Board.boardVariables.enPassant = enPassant;
        Board.boardVariables.halfMoveClock = parseInt(halfMoveClock, 10);
        Board.boardVariables.fullMovesNumber = parseInt(fullMovesNumber, 10);
    }

    public emptyBoard(): void {
        this.board = new Board();
        this.movesList = [];
        this.undoMovesStack = [];
    }

    public setUpBoard(): void {
        this.movesList = [];
        this.undoMovesStack = [];

        this.setBoardFromFEN(this.INITIAL_FULL_FEN);
        Board.setBoardVariables();

        this.whiteControlledTiles = this.getWhiteControlledTiles();
        this.blackControlledTiles = this.getBlackControlledTiles();
    }

    private getBoardPiecesInFEN(): string {
        let fen = '';
        const board = this.board.getTiles();
        for (let y = 7; y >= 0; y--) {
            let out = '';
            let emptyCount = 0;
            for (let x = 0; x < 8; x++) {
                const piece = board[(y * 8) + x];
                if (!(piece instanceof EmptyTile)) {
                    if (emptyCount > 0) {
                        out += emptyCount;
                        emptyCount = 0;
                    }
                    out += piece.str();
                } else {
                    emptyCount++;
                }
            }
            fen += emptyCount > 0 ? `${out}${emptyCount}` : `${out}`;
            fen += y > 0 ? '/' : '';
            emptyCount = 0;
        }
        return fen + ' ';
    }

    private getNextToMoveFEN(): string {
        return this.nextToMove === Color.White ? 'w ' : 'b ';
    }

    private getCastlingRightsFEN(): string {
        let castlingRights = '';
        castlingRights = Board.boardVariables.whiteCanCastleKingSide ? 'K' : '';
        castlingRights += Board.boardVariables.whiteCanCastleQueenSide ? 'Q' : '';
        castlingRights += Board.boardVariables.blackCanCastleKingSide ? 'k' : '';
        castlingRights += Board.boardVariables.blackCanCastleQueenSide ? 'q' : '';
        if (castlingRights === '') {
            castlingRights = '-';
        }
        return castlingRights + ' ';
    }

    private getEnPassantTargetTileFEN(): string {
        let enPassant = '';
        if (this.movesList.length > 0) {
            const lastMove = this.movesList[this.movesList.length - 1];
            if (lastMove.piece instanceof Pawn && lastMove.piece.color === Color.White) {
                if (lastMove.from[1] === '2' && lastMove.to[1] === '4') {
                    enPassant = lastMove.from[0] + '3';
                }
            } else if (lastMove.piece instanceof Pawn && lastMove.piece.color === Color.Black) {
                if (lastMove.from[1] === '7' && lastMove.to[1] === '5') {
                    enPassant = lastMove.from[0] + '6';
                }
            }
        }
        if (enPassant === '') {
            enPassant = '-';
        }
        return enPassant + ' ';
    }

    private getHalfMoveClockFEN(): string {
        return Board.boardVariables.halfMoveClock + ' ';
    }

    private getFullMovesNumberFEN(): string {
        return Board.boardVariables.fullMovesNumber.toString();
    }

    private setPiecesFEN(board: string): void {
        const rows = board.split('/');
        let rowsIndex = 0;
        let rowColumn = 0;
        for (let y = 7; y >= 0; y--) {
            for (let x = 0; x < 8; x++) {
                if (this.isNumber(rows[rowsIndex][rowColumn])) {
                    x += parseInt(rows[rowsIndex][rowColumn], 10) - 1;
                } else {
                    this.placePiece(rows[rowsIndex][rowColumn], ChessEngine.indexToCoord((y * 8) + x));
                }
                rowColumn += 1;
            }
            rowsIndex++;
            rowColumn = 0;
        }
    }

    private setCastlingRightsFEN(castlingRights: string): void {
        if (castlingRights === '-') {
            Board.boardVariables.whiteCanCastleKingSide = false;
            Board.boardVariables.whiteCanCastleQueenSide = false;
            Board.boardVariables.blackCanCastleKingSide = false;
            Board.boardVariables.blackCanCastleQueenSide = false;
        } else {
            for (const side of castlingRights) {
                switch (side) {
                    case 'K':
                        Board.boardVariables.whiteCanCastleKingSide = true;
                        break;
                    case 'Q':
                        Board.boardVariables.whiteCanCastleQueenSide = true;
                        break;
                    case 'k':
                        Board.boardVariables.blackCanCastleKingSide = true;
                        break;
                    case 'q':
                        Board.boardVariables.blackCanCastleQueenSide = true;
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private updateActivePiecesIfCapture(pieceCaptured: Piece | undefined): void {
        if (pieceCaptured) {
            this.board.activePieces = this.board.activePieces.filter((active) => active !== pieceCaptured);
            // console.log(`captured ${hasCaptured.color} ${hasCaptured.constructor.name}`);
        }
    }

    private updateControlledTiles(): void {
        this.whiteControlledTiles = this.getWhiteControlledTiles();
        this.blackControlledTiles = this.getBlackControlledTiles();
    }

    private getWhiteControlledTiles(): Array<string> {
        this.whiteControlledTiles = [];
        const whitePieces = this.board.getActivePieces(Color.White);
        for (const piece of whitePieces) {
            this.whiteControlledTiles = !(piece instanceof Pawn)
                ? this.whiteControlledTiles.concat(piece.validMoves([]))
                : this.whiteControlledTiles.concat((piece as Pawn).validCaptures(this.getEnPassantTargetTileFEN().trim()));
        }
        return [...new Set(this.whiteControlledTiles)];
    }

    private getBlackControlledTiles(): Array<string> {
        this.blackControlledTiles = [];
        const blackPieces = this.board.getActivePieces(Color.Black);
        for (const piece of blackPieces) {
            this.blackControlledTiles = !(piece instanceof Pawn)
                ? this.blackControlledTiles.concat(piece.validMoves([]))
                : this.blackControlledTiles.concat((piece as Pawn).validCaptures(this.getEnPassantTargetTileFEN().trim()));

        }
        return [...new Set(this.blackControlledTiles)];
    }

    private isNotEmptyTileAndNextColorToMove(piece: Tile): boolean {
        return !(piece instanceof EmptyTile) && piece.color === this.nextToMove;
    }

    private getOppositeSideControlledTilesBasedOnColor(color: Color): Array<string> {
        return color === Color.White ? this.blackControlledTiles : this.whiteControlledTiles;
    }

    private isKingInCheckBasedOnColor(color: Color): boolean {
        return color === Color.White ? Board.boardVariables.whiteKingInCheck : Board.boardVariables.blackKingInCheck;
    }

    private isKingInCheckmateBasedOnColor(color: Color): boolean {
        let checkmate = true;
        const oppositeSideControlledTiles = this.getOppositeSideControlledTilesBasedOnColor(color);
        for (const pieceToCheck of this.getActivePieces(color)) {
            if (pieceToCheck instanceof King) {
                const contained = oppositeSideControlledTiles.some((controls) => pieceToCheck.validMoves(oppositeSideControlledTiles).includes(controls));
                if (!contained) {
                    checkmate = false;
                }
            } else {
                const validMoves = pieceToCheck instanceof Pawn
                    ? pieceToCheck.validMoves(oppositeSideControlledTiles, this.getEnPassantTargetTileFEN().trim())
                    : pieceToCheck.validMoves(oppositeSideControlledTiles);
                for (const move of validMoves) {
                    this.makeMove({
                        from: pieceToCheck.coord,
                        to: move,
                        promotionChoice: undefined,
                        redoMove: false,
                        pseudoMove: true
                    });
                    if (!this.isKingInCheckBasedOnColor(color)) {
                        checkmate = false;
                        this.undoLastHalfMove(true);
                    } else {
                        this.undoLastHalfMove(true);
                    }
                }
            }
        }
        return checkmate;
    }

    private isValidMove(piece: Piece, controlledTiles: Array<string>, to: string, promotionChoice: PromotionChoice | undefined): boolean {
        let pawnCanBePromoted = true;
        if (promotionChoice) {
            pawnCanBePromoted = this.pawnCanBePromoted(piece.color, to, promotionChoice);
        }
        return pawnCanBePromoted && piece.validMoves(controlledTiles, this.getEnPassantTargetTileFEN().trim()).includes(to);
    }

    private pawnCanBePromoted(color: string, to: string, choice: PromotionChoice): boolean {
        if (color === Color.White && to[1] === '8' &&
            (choice === PromotionChoice.WhiteKnight || choice === PromotionChoice.WhiteBishop ||
             choice === PromotionChoice.WhiteRook || choice === PromotionChoice.WhiteQueen)) {
            return true;
        }
        if (color === Color.Black && to[1] === '1' &&
            (choice === PromotionChoice.BlackKnight || choice === PromotionChoice.BlackBishop ||
            choice === PromotionChoice.BlackRook || choice === PromotionChoice.BlackQueen)) {
            return true;
        }
        return false;
    }

    private determineIfOppositeKingIsInCheck(piece: Piece, opposideSideControlledTiles: Array<string>): void {
        const oppositeColor = piece.color === Color.White ? Color.Black : Color.White;
        for (const pieceToCheck of this.getActivePieces(oppositeColor)) {
            if (pieceToCheck instanceof King) {
                const pieceControlledTiles = piece.validMoves(opposideSideControlledTiles);
                if (pieceControlledTiles.includes(pieceToCheck.coord)) {
                    if (pieceToCheck.color === Color.White) {
                        Board.boardVariables.whiteKingInCheck = true;
                    } else {
                        Board.boardVariables.blackKingInCheck = true;
                    }
                } else {
                    if (pieceToCheck.color === Color.White) {
                        Board.boardVariables.whiteKingInCheck = false;
                    } else {
                        Board.boardVariables.blackKingInCheck = false;
                    }
                }
            }
        }
    }

    private determineIfSameSideKingIsInCheck(color: Color, opposideSideControlledTiles: Array<string>): void {
        for (const pieceToCheck of this.getActivePieces()) {
            if (pieceToCheck instanceof King && pieceToCheck.color === color) {
                if (opposideSideControlledTiles.includes(pieceToCheck.coord)) {
                    if (pieceToCheck.color === Color.White) {
                        Board.boardVariables.whiteKingInCheck = true;
                    } else {
                        Board.boardVariables.blackKingInCheck = true;
                    }
                } else {
                    if (pieceToCheck.color === Color.White) {
                        Board.boardVariables.whiteKingInCheck = false;
                    } else {
                        Board.boardVariables.blackKingInCheck = false;
                    }
                }
            }
        }
    }

    private determineCastlingRights(): void {
        if (this.areWhiteKingSideCastlingTilesControlled()) {
            Board.boardVariables.whiteCanCastleKingSide = false;
        } else if (!this.haveWhiteKingSideCastlingPiecesMoved()) {
            Board.boardVariables.whiteCanCastleKingSide = true;
        }

        if (this.areWhiteQueenSideCastlingTilesControlled()) {
            Board.boardVariables.whiteCanCastleQueenSide = false;
        } else if (!this.haveWhiteQueenSideCastlingPiecesMoved()) {
            Board.boardVariables.whiteCanCastleQueenSide = true;
        }

        if (this.areBlackKingSideCastlingTilesControlled()) {
            Board.boardVariables.blackCanCastleKingSide = false;
        } else if (!this.haveBlackKingSideCastlingPiecesMoved()) {
            Board.boardVariables.blackCanCastleKingSide = true;
        }

        if (this.areBlackQueenSideCastlingTilesControlled()) {
            Board.boardVariables.blackCanCastleQueenSide = false;
        } else if (!this.haveBlackQueenSideCastlingPiecesMoved()) {
            Board.boardVariables.blackCanCastleQueenSide = true;
        }
    }

    private determineDraw(): void {
        this.determineStalemate();
        // TODO: Insufficient Material
        this.determineRepetitionRule();
        this.determineHalfClockRule();
    }

    private determineStalemate(): void {
        const whiteStalemate = this.determineStalemateForSide(Color.White);
        const blackStalemate = this.determineStalemateForSide(Color.Black);
        Board.boardVariables.stalemate = whiteStalemate || blackStalemate;
        this.movesList[this.movesList.length - 1].boardVariables.stalemate = whiteStalemate || blackStalemate;
    }

    private determineStalemateForSide(side: Color): boolean {
        let stalemate = true;
        const opposideSide = side === Color.White ? Color.Black : Color.White;
        const activePieces = this.getActivePieces(side);
        const controlledTilesOpposideSide = side === Color.White ? this.blackControlledTiles : this.whiteControlledTiles;
        for (const piece of activePieces) {
            if (piece instanceof King) {
                const validMoves = piece.validMoves(controlledTilesOpposideSide);
                if (!controlledTilesOpposideSide.some((controls) => validMoves.includes(controls))) {
                    stalemate = false;
                }
            } else if (piece instanceof Pawn) {
                const validMoves = piece.validMoves(controlledTilesOpposideSide, Board.boardVariables.enPassant);
                if (validMoves.length > 0) {
                    stalemate = false;
                }
            } else {
                const validMoves = piece.validMoves(controlledTilesOpposideSide);
                if (validMoves.length > 0) {
                    stalemate = false;
                }
            }
        }
        return stalemate;
    }

    private determineRepetitionRule(): void {
        if (this.movesList.length >= 3) {
            const lastFEN = this.movesList[this.movesList.length - 1].fenBoard;
            const allFEN = [this.INITIAL_BOARD_FEN];
            for (const move of this.movesList) {
                allFEN.push(move.fenBoard);
            }
            if (this.countOccurrences(allFEN, lastFEN) === 3) {
                Board.boardVariables.repetitionRule = true;
                this.movesList[this.movesList.length - 1].boardVariables.repetitionRule = true;
            }
        }
    }

    private determineHalfClockRule(): void {
        if (this.getHalfMoveClockFEN().trim() === '50') {
            Board.boardVariables.halfMoveClockRule = true;
            this.movesList[this.movesList.length - 1].boardVariables.halfMoveClockRule = true;
        }
    }

    private countOccurrences(arr: Array<string>, val: string): number {
        return arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
    }

    private areWhiteKingSideCastlingTilesControlled(): boolean {
        return this.blackControlledTiles.includes('e1') || this.blackControlledTiles.includes('f1') || this.blackControlledTiles.includes('g1');
    }

    private areWhiteQueenSideCastlingTilesControlled(): boolean {
        return this.blackControlledTiles.includes('e1') || this.blackControlledTiles.includes('d1') || this.blackControlledTiles.includes('c1');
    }

    private areBlackKingSideCastlingTilesControlled(): boolean {
        return this.whiteControlledTiles.includes('e8') || this.whiteControlledTiles.includes('f8') || this.whiteControlledTiles.includes('g8');
    }

    private areBlackQueenSideCastlingTilesControlled(): boolean {
        return this.whiteControlledTiles.includes('e8') || this.whiteControlledTiles.includes('d8') || this.whiteControlledTiles.includes('c8');
    }

    private haveWhiteKingSideCastlingPiecesMoved(): boolean {
        const rook = Board.board[ChessEngine.coordToIndex('h1')] as Piece;
        const whiteKingSideRookDoesntExists = !(rook instanceof Rook) || rook.color !== Color.White;
        return Board.boardVariables.whiteKingMoved || Board.boardVariables.whiteKingRookMoved || whiteKingSideRookDoesntExists
            ? true
            : false;
    }

    private haveWhiteQueenSideCastlingPiecesMoved(): boolean {
        const rook = Board.board[ChessEngine.coordToIndex('a1')] as Piece;
        const whiteQueenSideRookDoesntExists = !(rook instanceof Rook) || rook.color !== Color.White;
        return Board.boardVariables.whiteKingMoved || Board.boardVariables.whiteQueenRookMoved || whiteQueenSideRookDoesntExists
            ? true
            : false;
    }

    private haveBlackKingSideCastlingPiecesMoved(): boolean {
        const rook = Board.board[ChessEngine.coordToIndex('h8')] as Piece;
        const blackKingSideRookDoesntExists = !(rook instanceof Rook) || rook.color !== Color.Black;
        return Board.boardVariables.blackKingMoved || Board.boardVariables.blackKingRookMoved || blackKingSideRookDoesntExists
            ? true
            : false;
    }

    private haveBlackQueenSideCastlingPiecesMoved(): boolean {
        const rook = Board.board[ChessEngine.coordToIndex('a8')] as Piece;
        const blackQueenSideRookDoesntExists = !(rook instanceof Rook) || rook.color !== Color.Black;
        return Board.boardVariables.blackKingMoved || Board.boardVariables.blackQueenRookMoved || blackQueenSideRookDoesntExists
            ? true
            : false;
    }

    private revertPiecesOnBoard(lastHalfMove: MoveEntry): void {
        this.revertActivePieceIfPawnWasPromoted(lastHalfMove);
        Board.board[ChessEngine.coordToIndex(lastHalfMove.from)] = lastHalfMove.piece;
        (Board.board[ChessEngine.coordToIndex(lastHalfMove.from)] as Piece).coord = lastHalfMove.from;
        if (lastHalfMove.capturedPiece) {
            if (Board.boardVariables.enPassant === '-') {
                Board.board[ChessEngine.coordToIndex(lastHalfMove.to)] = lastHalfMove.capturedPiece;
            } else {
                Board.board[ChessEngine.coordToIndex(lastHalfMove.capturedPiece.coord)] = lastHalfMove.capturedPiece;
                Board.board[ChessEngine.coordToIndex(lastHalfMove.to)] = new EmptyTile();
            }
            this.board.activePieces.push(lastHalfMove.capturedPiece);
        } else {
            Board.board[ChessEngine.coordToIndex(lastHalfMove.to)] = new EmptyTile();
        }
    }

    private revertActivePieceIfPawnWasPromoted(lastHalfMove: MoveEntry): void {
        if (lastHalfMove.piece.constructor.name !== Board.board[ChessEngine.coordToIndex(lastHalfMove.to)].constructor.name) {
            this.board.activePieces = this.board.activePieces.filter((active) => active !== Board.board[ChessEngine.coordToIndex(lastHalfMove.to)]);
            this.board.activePieces.push(lastHalfMove.piece as Piece);
        }
    }

    private undoCastlingRooksIfNeeded(lastHalfMove: MoveEntry): void {
        if (lastHalfMove.piece instanceof King && lastHalfMove.from === 'e1' && lastHalfMove.to === 'g1') {
            Board.board[ChessEngine.coordToIndex('h1')] = Board.board[ChessEngine.coordToIndex('f1')];
            Board.board[ChessEngine.coordToIndex('f1')] = new EmptyTile();
        }
        if (lastHalfMove.piece instanceof King && lastHalfMove.from === 'e1' && lastHalfMove.to === 'c1') {
            Board.board[ChessEngine.coordToIndex('a1')] = Board.board[ChessEngine.coordToIndex('d1')];
            Board.board[ChessEngine.coordToIndex('d1')] = new EmptyTile();
        }
        if (lastHalfMove.piece instanceof King && lastHalfMove.from === 'e8' && lastHalfMove.to === 'g8') {
            Board.board[ChessEngine.coordToIndex('h8')] = Board.board[ChessEngine.coordToIndex('f8')];
            Board.board[ChessEngine.coordToIndex('f8')] = new EmptyTile();
        }
        if (lastHalfMove.piece instanceof King && lastHalfMove.from === 'e8' && lastHalfMove.to === 'c8') {
            Board.board[ChessEngine.coordToIndex('a8')] = Board.board[ChessEngine.coordToIndex('d8')];
            Board.board[ChessEngine.coordToIndex('d8')] = new EmptyTile();
        }
    }

    private increaseFullMovesNumber(): void {
        if (this.nextToMove === Color.White) {
            Board.boardVariables.fullMovesNumber += 1;
        }
    }

    private isNumber(char: string): boolean {
        return /^\d$/.test(char);
      }

    public static coordToIndex(coord: string): number {
        const col = coord.charCodeAt(0) - this.ASCII_OFFSET;
        const row = parseInt(coord.charAt(1), 10);
        return col + ((row - 1) * 8);
    }

    public static indexToCoord(index: number): string {
        const col = String.fromCharCode((index % 8) + this.ASCII_OFFSET);
        const row = Math.floor(index / 8) + 1;
        return col + row;
    }

    public static isValidCoord(coord: string): boolean {
        return Object.values(Cols).includes(coord.charAt(0) as Cols) &&
            (parseInt(coord.charAt(1), 10) >= 1 && parseInt(coord.charAt(1), 10) <= 8);
    }
}

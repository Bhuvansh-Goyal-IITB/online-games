"use client";

import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { Chess, Color, Move, PieceInfo } from "@repo/chess";
import { ChessContext } from "@ui/context/chessContext";
import { PieceSet } from "./types";

export interface IChessPreferences {
  flip: boolean;
  animation: boolean;
  pieceSet: PieceSet;
  showLegalMoves: boolean;
  highlightMoves: boolean;
}

export interface IPlayerInfo {
  name: string;
  image?: string;
}

interface ChessContextProviderProps extends PropsWithChildren {
  selfGame?: boolean;
}

export const ChessContextProvider: FC<ChessContextProviderProps> = ({
  selfGame = false,
  children,
}) => {
  const chessRef = useRef(new Chess());

  const [whitePlayerInfo, setWhitePlayerInfo] = useState<IPlayerInfo | null>(
    null,
  );
  const [blackPlayerInfo, setBlackPlayerInfo] = useState<IPlayerInfo | null>(
    null,
  );

  const [gameStarted, setGameStarted] = useState(selfGame);
  const [preferences, setPreferences] = useState<IChessPreferences>({
    flip: false,
    animation: true,
    pieceSet: "cardinal",
    showLegalMoves: true,
    highlightMoves: true,
  });
  const [fen, setFen] = useState(chessRef.current.getBoardInfoAt(0).fen);
  const [pieceList, setPieceList] = useState(
    chessRef.current.getBoardInfoAt(0).pieceList,
  );
  const [index, setIndex] = useState(0);
  const [lastMove, setLastMove] = useState<Omit<Move, "capturedPiece"> | null>(
    null,
  );
  const [validMoves, setValidMoves] = useState(
    gameStarted ? chessRef.current.validMoves : [],
  );
  const [canAnimate, setCanAnimate] = useState(true);
  const [promotionMove, setPromotionMove] = useState<number[] | null>(null);

  const [currentPlayerColor, setCurrentPlayerColor] = useState<Color | null>(
    null,
  );

  const [selectedPiece, setSelectedPiece] = useState<Omit<
    PieceInfo,
    "id"
  > | null>(null);

  const currentTurn = fen.split(" ")[1]! as Color;
  const moveList = chessRef.current.getMoveNotations();

  const moveMultiple = (moveList: string[]) => {
    let movesMade = 0;
    for (let i = 0; i < moveList.length; i++) {
      chessRef.current.move(moveList[i]!);
      movesMade++;
      if (chessRef.current.outcome[0] != "") break;
    }

    const newIndex = chessRef.current.getMoveNotations().length;

    const boardInfo = chessRef.current.getBoardInfoAt(newIndex);
    setFen(boardInfo.fen);
    setPieceList(boardInfo.pieceList);
    setLastMove(chessRef.current.getMoveAt(newIndex - 1));

    if (selfGame || currentPlayerColor == boardInfo.fen.split(" ")[1]) {
      setValidMoves(chessRef.current.validMoves);
    } else {
      setValidMoves([]);
    }
    setIndex(newIndex);

    if (movesMade == 1) {
      setCanAnimate(true);
    } else {
      setCanAnimate(false);
    }
  };

  const movePiece = (moveString: string, animate?: boolean) => {
    moveMultiple([moveString]);
    if (animate) {
      setCanAnimate(animate);
    } else {
      setCanAnimate(true);
    }
  };

  const undo = () => {
    if (!selfGame) return;
    const movesMade = chessRef.current.getMoveNotations().length;
    if (movesMade > 0) {
      chessRef.current.undo();
      const boardInfo = chessRef.current.getBoardInfoAt(movesMade - 1);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);

      if (movesMade == 1) {
        setLastMove(null);
      } else {
        setLastMove(chessRef.current.getMoveAt(movesMade - 2));
      }
      setValidMoves(chessRef.current.validMoves);
      setIndex(movesMade - 1);
      setCanAnimate(false);
    }
  };

  const loadFen = (fen: string) => {
    if (!selfGame) return;
    chessRef.current = new Chess(fen);
    const boardInfo = chessRef.current.getBoardInfoAt(0);
    setFen(boardInfo.fen);
    setPieceList(boardInfo.pieceList);
    setLastMove(null);
    setValidMoves(chessRef.current.validMoves);
    setIndex(0);
  };

  const loadMoves = (moveList: string[]) => {
    chessRef.current = new Chess();
    moveMultiple(moveList);
  };

  const getPGN = () => {
    let moveListPGN = "";

    moveList.forEach((moveString, index) => {
      const moveIndex = index / 2 + 1;

      if (index % 2 == 0) {
        moveListPGN += `${moveIndex}. `;
      }

      moveListPGN += `${moveString} `;
    });

    if (outcome[0] == "") {
      moveListPGN += "*";
    } else {
      if (outcome[0] == "w") {
        moveListPGN += "1-0";
      } else if (outcome[0] == "b") {
        moveListPGN += "0-1";
      } else {
        moveListPGN += "1/2-1/2";
      }
    }

    return `[Event "?"]\n[Site "?"]\n[Date "????.??.??"]\n[Round "?"]\n[White "${whitePlayerInfo ? whitePlayerInfo.name : "?"}"]\n[Black "${blackPlayerInfo ? blackPlayerInfo.name : "?"}"]\n[Result "${outcome[0] == "" ? "*" : outcome[0] == "w" ? "1-0" : outcome[0] == "b" ? "0-1" : "1/2-1/2"}"]\n\n${moveListPGN}`;
  };

  const previous = () => {
    if (index > 0) {
      const boardInfo = chessRef.current.getBoardInfoAt(index - 1);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);

      if (index == 1) {
        setLastMove(null);
      } else {
        setLastMove(chessRef.current.getMoveAt(index - 2));
      }
      setValidMoves([]);
      setIndex((prev) => prev - 1);
      setCanAnimate(true);
    }
  };

  const next = () => {
    const movesMade = chessRef.current.getMoveNotations().length;
    if (index < movesMade) {
      const boardInfo = chessRef.current.getBoardInfoAt(index + 1);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);
      setLastMove(chessRef.current.getMoveAt(index));

      if (
        index + 1 == movesMade &&
        (selfGame || currentPlayerColor == boardInfo.fen.split(" ")[1])
      ) {
        setValidMoves(chessRef.current.validMoves);
      }
      setIndex((prev) => prev + 1);
      setCanAnimate(true);
    }
  };

  const last = () => {
    const movesMade = chessRef.current.getMoveNotations().length;
    if (index != movesMade) {
      const boardInfo = chessRef.current.getBoardInfoAt(movesMade);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);

      if (movesMade > 0) {
        setLastMove(chessRef.current.getMoveAt(movesMade - 1));
      }

      if (selfGame || currentPlayerColor == boardInfo.fen.split(" ")[1]) {
        setValidMoves(chessRef.current.validMoves);
      }
      setIndex(movesMade);
      setCanAnimate(false);
    }
  };

  const first = () => {
    if (index != 0) {
      const movesMade = chessRef.current.getMoveNotations().length;

      const boardInfo = chessRef.current.getBoardInfoAt(0);
      setFen(boardInfo.fen);
      setPieceList(boardInfo.pieceList);
      setLastMove(null);

      if (
        movesMade == 0 &&
        (selfGame || currentPlayerColor == boardInfo.fen.split(" ")[1])
      ) {
        setValidMoves(chessRef.current.validMoves);
      } else {
        setValidMoves([]);
      }
      setIndex(0);
      setCanAnimate(false);
    }
  };

  const goToMove = (moveIndex: number) => {
    const movesMade = chessRef.current.getMoveNotations().length;
    if (moveIndex < 0 || moveIndex > movesMade - 1 || moveIndex + 1 == index)
      return;

    const boardInfo = chessRef.current.getBoardInfoAt(moveIndex + 1);
    setFen(boardInfo.fen);
    setPieceList(boardInfo.pieceList);

    setLastMove(chessRef.current.getMoveAt(moveIndex));
    if (
      moveIndex == movesMade - 1 &&
      (selfGame || currentPlayerColor == boardInfo.fen.split(" ")[1])
    ) {
      setValidMoves(chessRef.current.validMoves);
    } else {
      setValidMoves([]);
    }
    setIndex(moveIndex + 1);
    setCanAnimate(false);
  };

  const getPlayerInfo = (playerColor: Color) => {
    return playerColor == "w" ? whitePlayerInfo : blackPlayerInfo;
  };

  const draw = () => {
    chessRef.current.draw();
    setValidMoves([]);
  };

  const resign = (resigningPlayerColor: Color) => {
    chessRef.current.resign(resigningPlayerColor);
    setValidMoves([]);
  };

  const timeout = (loosingPlayerColor: Color) => {
    chessRef.current.timeOut(loosingPlayerColor);
    setValidMoves([]);
  };

  const abandon = (leavingPlayerColor: Color) => {
    chessRef.current.abandon(leavingPlayerColor);
    setValidMoves([]);
  };

  const outcome = chessRef.current.outcome;

  useEffect(() => {
    if (gameStarted && currentPlayerColor) {
      if (currentPlayerColor == fen.split(" ")[1]) {
        setValidMoves(chessRef.current.validMoves);
      }
    }
  }, [gameStarted, currentPlayerColor]);
  return (
    <ChessContext.Provider
      value={{
        pieceList,
        lastMove,
        playerColor: currentPlayerColor,
        fen,
        selfGame,
        selectedPiece,
        canAnimate: canAnimate && preferences.animation,
        validMoves,
        currentTurn,
        outcome,
        promotionMove,
        preferences,
        currentIndex: index,
        moveList,
        setCurrentPlayerColor,
        setSelectedPiece,
        setPreferences,
        setPromotionMove,
        setWhitePlayerInfo,
        setBlackPlayerInfo,
        loadFen,
        loadMoves,
        movePiece,
        undo,
        previous,
        next,
        first,
        last,
        goToMove,
        getPlayerInfo,
        getPGN,
        draw,
        resign,
        timeout,
        abandon,
        startGame: () => {
          setGameStarted(true);
        },
      }}
    >
      {children}
    </ChessContext.Provider>
  );
};

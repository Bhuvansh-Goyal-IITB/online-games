import { FC } from "react";
import { useChessContext } from "../context/chessContext";
import { Chess } from "@repo/chess";

export const Check: FC = () => {
  const {
    lastMove,
    pieceList,
    currentTurn,
    preferences: { flip },
  } = useChessContext();

  if (
    lastMove &&
    (lastMove.notation.includes("+") || lastMove.notation.includes("#"))
  ) {
    const currentColorKing = pieceList.find(
      (piece) => piece.pieceType == "k" && piece.color == currentTurn
    )!;
    const displayPosition = flip
      ? 63 - currentColorKing.position
      : currentColorKing.position;
    return (
      <div
        style={{
          left: `${((displayPosition % 8) * 100) / 8}%`,
          top: `${(Math.floor(displayPosition / 8) * 100) / 8}%`,
        }}
        className="absolute w-[12.5%] h-[12.5%] z-0 bg-red-600 bg-opacity-60"
      />
    );
  } else {
    return <></>;
  }
};

export const LastMove: FC = () => {
  const {
    lastMove,
    preferences: { flip, highlightMoves },
  } = useChessContext();

  if (lastMove && highlightMoves) {
    const displayFromPosition = flip
      ? 63 - lastMove.move[0]!
      : lastMove.move[0]!;
    const displayToPosition = flip ? 63 - lastMove.move[1]! : lastMove.move[1]!;

    return (
      <>
        <div
          style={{
            left: `${((displayFromPosition % 8) * 100) / 8}%`,
            top: `${(Math.floor(displayFromPosition / 8) * 100) / 8}%`,
          }}
          className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
        />
        <div
          style={{
            left: `${((displayToPosition % 8) * 100) / 8}%`,
            top: `${(Math.floor(displayToPosition / 8) * 100) / 8}%`,
          }}
          className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
        />
      </>
    );
  } else {
    return <></>;
  }
};

export const ValidMoves: FC = () => {
  const {
    preferences: { flip, showLegalMoves },
    pieceList,
    selectedPiece,
    fen,
    validMoves,
  } = useChessContext();

  const enPassantFen = fen.split(" ")[3]!;
  const enPassantPosition =
    enPassantFen == "-" ? null : Chess.algebraic_to_position(enPassantFen);

  return (
    <>
      {selectedPiece &&
        showLegalMoves &&
        validMoves
          .filter((move) => move[0] == selectedPiece.position)
          .map((move) => {
            const displayPosition = flip ? 63 - move[1]! : move[1]!;
            const movedPiece = pieceList.find(
              (piece) => piece.position == move[0]!
            )!;

            if (
              pieceList.find((piece) => piece.position == move[1]!) ||
              (enPassantPosition &&
                movedPiece.pieceType == "p" &&
                enPassantPosition == move[1]!)
            ) {
              return (
                <div
                  style={{
                    left: `${((displayPosition % 8) * 100) / 8}%`,
                    top: `${(Math.floor(displayPosition / 8) * 100) / 8}%`,
                  }}
                  className="absolute flex justify-center items-center w-[12.5%] h-[12.5%] z-0 scale-transition"
                >
                  <div
                    style={{
                      background:
                        "radial-gradient(circle, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 0.35) 82%, rgba(0, 0, 0, 0.4) 84%)",
                    }}
                    className="w-full h-full"
                  />
                </div>
              );
            }
            return (
              <div
                style={{
                  left: `${((displayPosition % 8) * 100) / 8}%`,
                  top: `${(Math.floor(displayPosition / 8) * 100) / 8}%`,
                }}
                className="absolute flex justify-center items-center w-[12.5%] h-[12.5%] z-0 scale-transition"
              >
                <div className="w-[30%] h-[30%] rounded-full bg-[#000] bg-opacity-40" />
              </div>
            );
          })}
    </>
  );
};

export const SelectedPiece: FC = () => {
  const {
    preferences: { flip },
    selectedPiece,
  } = useChessContext();

  return (
    <>
      {selectedPiece && (
        <div
          style={{
            left: `${(((flip ? 63 - selectedPiece.position : selectedPiece.position) % 8) * 100) / 8}%`,
            top: `${(Math.floor((flip ? 63 - selectedPiece.position : selectedPiece.position) / 8) * 100) / 8}%`,
          }}
          className="absolute w-[12.5%] h-[12.5%] z-0 bg-yellow-500 bg-opacity-60"
        />
      )}
    </>
  );
};

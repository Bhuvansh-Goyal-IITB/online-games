import { Chess } from "@repo/chess";
import { useChessContext } from "./chessContext";

export const PromotionMenu = () => {
  const { setPromotionMove, currentTurn, promotionMove, movePiece } =
    useChessContext();

  return (
    <>
      {promotionMove && (
        <div
          className="absolute left-0 top-0 w-full h-full z-[5] bg-black bg-opacity-50"
          onClick={() => {
            setPromotionMove(null);
          }}
        >
          <div
            style={{
              left: `${((promotionMove[1]! % 8) * 100) / 8}%`,
            }}
            className={`absolute flex flex-col bg-white shadow-md shadow-black ${currentTurn == "w" ? "top-0" : "bottom-0"} w-[12.5%] h-[50%]`}
          >
            <div
              onClick={() => {
                setPromotionMove(null);
                movePiece(
                  `${Chess.position_to_algebraic(promotionMove[0]!)}${Chess.position_to_algebraic(promotionMove[1]!)}q`
                );
              }}
            >
              <img
                className="w-[95%] h-[95%] hover:cursor-pointer"
                src={`/cardinal/${currentTurn}/q.svg`}
                alt="chess piece"
              />
            </div>
            <div
              onClick={() => {
                setPromotionMove(null);
                movePiece(
                  `${Chess.position_to_algebraic(promotionMove[0]!)}${Chess.position_to_algebraic(promotionMove[1]!)}r`
                );
              }}
            >
              <img
                className="w-[95%] h-[95%] hover:cursor-pointer"
                src={`/cardinal/${currentTurn}/r.svg`}
                alt="chess piece"
              />
            </div>
            <div
              onClick={() => {
                setPromotionMove(null);
                movePiece(
                  `${Chess.position_to_algebraic(promotionMove[0]!)}${Chess.position_to_algebraic(promotionMove[1]!)}b`
                );
              }}
            >
              <img
                className="w-[95%] h-[95%] hover:cursor-pointer"
                src={`/cardinal/${currentTurn}/b.svg`}
                alt="chess piece"
              />
            </div>

            <div
              onClick={() => {
                setPromotionMove(null);
                movePiece(
                  `${Chess.position_to_algebraic(promotionMove[0]!)}${Chess.position_to_algebraic(promotionMove[1]!)}n`
                );
              }}
            >
              <img
                className="w-[95%] h-[95%] hover:cursor-pointer"
                src={`/cardinal/${currentTurn}/n.svg`}
                alt="chess piece"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

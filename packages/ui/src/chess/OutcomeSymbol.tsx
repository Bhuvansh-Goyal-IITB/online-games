import { Color, PieceType } from "@repo/chess";
import { FC, PropsWithChildren } from "react";
import { useChessContext } from "../context/chessContext";

interface OutcomeSymbolProps {
  pieceType: PieceType;
  color: Color;
  position: number;
}

interface ContainerDivProps extends PropsWithChildren {
  position: number;
}

const ContainerDiv: FC<ContainerDivProps> = ({ position, children }) => {
  return (
    <div
      className={`absolute ${position % 8 != 7 ? "-right-4" : "right-1"} ${Math.floor(position / 8) != 0 ? "-top-4" : "top-1"} w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10`}
    >
      {children}
    </div>
  );
};

export const OutcomeSymbol: FC<OutcomeSymbolProps> = ({
  pieceType,
  color,
  position,
}) => {
  const { currentIndex, moveList, outcome } = useChessContext();

  return (
    <>
      {pieceType == "k" &&
        currentIndex == moveList.length &&
        (outcome[0] == "w" ? (
          color == "w" ? (
            <ContainerDiv position={position}>
              <img className="w-full h-full" src="/crown.svg" />
            </ContainerDiv>
          ) : outcome[1] == "resignation" ? (
            <ContainerDiv position={position}>
              <img src="/black-resign.svg" />
            </ContainerDiv>
          ) : outcome[1] == "abandon" ? (
            <ContainerDiv position={position}>
              <img className="rounded-full bg-[#E02828]" src="/abandon.svg" />
            </ContainerDiv>
          ) : outcome[1] == "time" ? (
            <ContainerDiv position={position}>
              <img className="rounded-full bg-[#E02828]" src="/timeout.svg" />
            </ContainerDiv>
          ) : (
            <ContainerDiv position={position}>
              <img src="/black-mate.svg" />
            </ContainerDiv>
          )
        ) : outcome[0] == "b" ? (
          color == "w" ? (
            outcome[1] == "abandon" ? (
              <ContainerDiv position={position}>
                <img className="rounded-full bg-[#E02828]" src="/abandon.svg" />
              </ContainerDiv>
            ) : outcome[1] == "time" ? (
              <ContainerDiv position={position}>
                <img className="rounded-full bg-[#E02828]" src="/timeout.svg" />
              </ContainerDiv>
            ) : outcome[1] == "resignation" ? (
              <ContainerDiv position={position}>
                <img src="/white-resign.svg" />
              </ContainerDiv>
            ) : (
              <ContainerDiv position={position}>
                <img src="/white-mate.svg" />
              </ContainerDiv>
            )
          ) : (
            <ContainerDiv position={position}>
              <img src="/crown.svg" />
            </ContainerDiv>
          )
        ) : outcome[0] == "d" ? (
          color == "w" ? (
            <ContainerDiv position={position}>
              <img src="/draw-white.svg" />
            </ContainerDiv>
          ) : (
            <ContainerDiv position={position}>
              <img src="/draw-black.svg" />
            </ContainerDiv>
          )
        ) : (
          <></>
        ))}
    </>
  );
};

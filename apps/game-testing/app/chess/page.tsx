"use client";

import { Chess, Move, PieceType } from "@repo/chess";
import ChessBoard from "@repo/ui/chess/ChessBoard";
import MoveList from "@repo/ui/chess/MoveList";
import { PieceSet } from "@ui/chess/types";
import { ModeToggle } from "@ui/components/mode-toggle";
import { Button } from "@ui/components/ui/button";
import { Card, CardContent } from "@ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@ui/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select";
import { Switch } from "@ui/components/ui/switch";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Settings,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  const boardHistory = useRef([chess.board]);
  const moveHistory = useRef<Move[]>([]);
  const moveNotationList = useRef<string[][]>([]);

  const [index, setIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const [pieceSet, setPieceSet] = useState<PieceSet>("cardinal");

  const moveListDivRef = useRef<HTMLDivElement | null>(null);

  const [animatedPiecePositions, setAnimatedPiecePositions] = useState<
    number[] | null
  >(null);

  const animationControl = (move: Move | null, isPrev: boolean) => {
    if (move == null) {
      setAnimatedPiecePositions(null);
      return;
    }

    if (move.isCastling) {
      if (move.from > move.to) {
        isPrev
          ? setAnimatedPiecePositions([move.from, move.to - 2])
          : setAnimatedPiecePositions([move.to, move.to + 1]);
      } else {
        isPrev
          ? setAnimatedPiecePositions([move.from, move.to + 1])
          : setAnimatedPiecePositions([move.to, move.to - 1]);
      }
    } else {
      isPrev
        ? setAnimatedPiecePositions([move.from])
        : setAnimatedPiecePositions([move.to]);
    }
  };

  const handleFirst = () => {
    setIndex(0);
    setBoard(boardHistory.current[0]!);
    setLastMove(null);
    setAnimatedPiecePositions(null);
  };
  const handlePrevious = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
      setBoard(boardHistory.current[index - 1]!);

      if (index == 1) {
        setLastMove(null);
      } else {
        setLastMove(moveHistory.current[index - 2]!);
      }
    }
    animationControl(moveHistory.current[index - 1]!, true);
  };
  const handleNext = () => {
    if (index < boardHistory.current.length - 1) {
      setIndex((prev) => prev + 1);
      setBoard(boardHistory.current[index + 1]!);
      setLastMove(moveHistory.current[index]!);

      animationControl(moveHistory.current[index]!, false);
    }
  };
  const handleLast = () => {
    setIndex(boardHistory.current.length - 1);
    setBoard(boardHistory.current.at(-1)!);
    setLastMove(moveHistory.current.at(-1) ?? null);

    setAnimatedPiecePositions(null);
  };

  //TODO: Figure out undo and animations as the piece's previous location are getting reset
  // const undo = () => {
  //   if (boardHistory.current.length == 1) return;

  //   let newIndex = boardHistory.current.length - 2;

  //   setIndex(newIndex);

  //   boardHistory.current.pop();
  //   moveHistory.current.pop();

  //   setChess(new Chess(boardHistory.current.at(-1)!.fen));
  //   if (moveNotationList.current.at(-1)!.length == 1) {
  //     moveNotationList.current.pop();
  //   } else {
  //     moveNotationList.current.at(-1)!.pop();
  //   }

  //   setBoard(boardHistory.current.at(-1)!);
  //   setLastMove(moveHistory.current.at(-1) ?? null);

  //   animationControl(moveHistory.current.at(-1) ?? null, false);
  // };

  const goToMove = (moveIndex: number) => {
    setIndex(moveIndex + 1);
    setBoard(boardHistory.current.at(moveIndex + 1)!);
    setLastMove(moveHistory.current.at(moveIndex)!);

    setAnimatedPiecePositions(null);
  };

  const movePiece = (move: Move, promoteTo?: Exclude<PieceType, "k" | "p">) => {
    let moveNotation = chess.move(move.from, move.to, promoteTo)!;

    setBoard(chess.board);
    setIndex((prev) => prev + 1);
    setLastMove(move);

    if (moveNotationList.current.length == 0) {
      moveNotationList.current.push([moveNotation]);
    } else {
      if (moveNotationList.current.at(-1)!.length == 1) {
        moveNotationList.current.at(-1)!.push(moveNotation);
      } else {
        moveNotationList.current.push([moveNotation]);
      }
    }

    boardHistory.current.push(chess.board);
    moveHistory.current.push(move);
  };

  return (
    <div className="min-h-[100%] flex justify-center lg:items-center bg-neutral-600 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div>
          <div className="aspect-square w-fit h-fit rounded-md overflow-hidden border-neutral-900 border-4">
            <ChessBoard
              board={board}
              canMakeMoves={index == boardHistory.current.length - 1}
              flip={flip}
              pieceSet={pieceSet}
              lastMove={lastMove}
              movePiece={movePiece}
              animatedPiecePositions={animatedPiecePositions}
              setAnimatedPiecePositions={setAnimatedPiecePositions}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="grow h-full">
            <Card className="h-full">
              <CardContent className="h-full">
                <div className="flex flex-col h-full">
                  <div
                    ref={moveListDivRef}
                    className="flex flex-col gap-4 pb-4 mt-6 grow max-h-[700px] overflow-auto"
                  >
                    <MoveList
                      currentIndex={index}
                      moveList={moveNotationList.current}
                      goToMove={goToMove}
                    />
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      className="p-4 py-2 lg:p-6 grow"
                      variant="secondary"
                      onClick={handleFirst}
                    >
                      <ChevronFirst className="w-6 h-6 lg:w-8 lg:h-8" />
                    </Button>
                    <Button
                      className="p-4 py-2 lg:p-6 grow"
                      variant="secondary"
                      onClick={handlePrevious}
                    >
                      <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
                    </Button>
                    <Button
                      className="p-4 py-2 lg:p-6 grow"
                      variant="secondary"
                      onClick={handleNext}
                    >
                      <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
                    </Button>
                    <Button
                      className="p-4 py-2 lg:p-6 grow"
                      variant="secondary"
                      onClick={handleLast}
                    >
                      <ChevronLast className="w-6 h-6 lg:w-8 lg:h-8" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[340px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Settings</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 items-start px-2">
                  <div className="flex w-full justify-between">
                    <span>Flip</span>
                    <div>
                      <Switch
                        checked={flip}
                        onCheckedChange={(value) => setFlip(value)}
                      />
                    </div>
                  </div>
                  <div className="flex w-full justify-between">
                    <span>Piece Set</span>
                    <div>
                      <Select
                        value={pieceSet}
                        onValueChange={(value) => {
                          setPieceSet(value as PieceSet);
                        }}
                        defaultValue="cardinal"
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="cardinal">Cardinal</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <Button variant="outline" size="icon">
                <Undo2 className="w-5 h-5" />
              </Button>
            </div>
            <div>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

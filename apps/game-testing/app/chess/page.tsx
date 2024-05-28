"use client";

import { Chess, Color, Move, PieceType } from "@repo/chess";
import ChessBoard from "@repo/ui/chess/ChessBoard";
import MoveList from "@repo/ui/chess/MoveList";
import { PieceSet } from "@ui/chess/types";
import { ModeToggle } from "@ui/components/mode-toggle";
import { Button } from "@ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ui/components/ui/card";
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
  const chessRef = useRef(new Chess());

  const [boardInfo, setBoardInfo] = useState(
    chessRef.current.getBoardInfoAt(0)
  );

  const [pieceSet, setPieceSet] = useState<PieceSet>("cardinal");

  const [lastMove, setLastMove] = useState<{
    move: number[];
    notation: string;
  } | null>(null);
  const [flip, setFlip] = useState(false);
  const [dontAnimate, setDontAnimate] = useState(false);
  const [index, setIndex] = useState(0);
  const [movesMade, setMovesMade] = useState(0);

  const canMakeMoves = index == movesMade && chessRef.current.outcome[0] == "";

  const move = (
    from: number,
    to: number,
    promoteTo?: Exclude<PieceType, "k" | "p">
  ) => {
    if (!canMakeMoves) return;
    chessRef.current.move(from, to, promoteTo);
    setIndex((prev) => prev + 1);
    setMovesMade((prev) => prev + 1);
    setBoardInfo(chessRef.current.getBoardInfoAt(index + 1));
    setLastMove(chessRef.current.getMoveAt(index));
    setDontAnimate(false);
  };

  const handleFirst = () => {
    setIndex(0);
    setBoardInfo(chessRef.current.getBoardInfoAt(0));
    setDontAnimate(true);
    setLastMove(null);
  };
  const handlePrevious = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
      setBoardInfo(chessRef.current.getBoardInfoAt(index - 1));
      setDontAnimate(false);
      if (index == 1) {
        setLastMove(null);
      } else {
        setLastMove(chessRef.current.getMoveAt(index - 2));
      }
    }
  };
  const handleNext = () => {
    if (index < movesMade) {
      setIndex((prev) => prev + 1);
      setBoardInfo(chessRef.current.getBoardInfoAt(index + 1));
      setDontAnimate(false);
      setLastMove(chessRef.current.getMoveAt(index));
    }
  };
  const handleLast = () => {
    setIndex(movesMade);
    setBoardInfo(chessRef.current.getBoardInfoAt(movesMade));
    if (movesMade == 0) {
      setLastMove(null);
    } else {
      setLastMove(chessRef.current.getMoveAt(movesMade - 1));
    }
    setDontAnimate(true);
  };

  const goToMove = (index: number) => {
    setIndex(index + 1);
    setBoardInfo(chessRef.current.getBoardInfoAt(index + 1));
    setLastMove(chessRef.current.getMoveAt(index));
    setDontAnimate(true);
  };

  return (
    <div className="min-h-[100%] flex justify-center lg:items-center bg-neutral-600 p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div>
          <div className="aspect-square w-fit h-fit rounded-md overflow-hidden border-neutral-900 border-4">
            <ChessBoard
              pieceList={boardInfo.pieceList}
              enPassantPosition={
                boardInfo.fen.split(" ")[3]! == "-"
                  ? null
                  : Chess.algebraic_to_position(boardInfo.fen.split(" ")[3]!)
              }
              currentTurn={boardInfo.fen.split(" ")[1] as Color}
              move={move}
              dontAnimate={dontAnimate}
              lastMove={lastMove}
              flip={flip}
              validMoves={chessRef.current.validMoves}
              canMakeMoves={canMakeMoves}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="grow h-full">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle>Move History</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full grow">
                <div className="flex flex-col gap-4 pb-4 px-3 mb-4 grow max-h-[300px] lg:max-h-[640px] overflow-auto">
                  <div>
                    <MoveList
                      currentIndex={index}
                      moveList={chessRef.current.getMoveNotations()}
                      goToMove={goToMove}
                    />
                  </div>
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

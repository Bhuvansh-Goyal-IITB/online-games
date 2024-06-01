"use client";

import { useWebSocket } from "@/app/components/SocketProvider";
import { Chess, Color, Move, PieceType } from "@repo/chess";
import ChessBoard from "@repo/ui/chess/ChessBoard";
import MoveList from "@repo/ui/chess/MoveList";
import { PieceSet } from "@ui/chess/types";
import { ModeToggle } from "@ui/components/mode-toggle";
import { Button } from "@ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

function GameOverScreen({
  outcome,
  outcomeMethod,
  setGameOverScreen,
}: {
  outcome: string;
  outcomeMethod: string;
  setGameOverScreen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <>
      <div
        className="absolute overflow-hidden flex justify-center items-center left-0 top-0 w-full h-full z-[5] bg-black bg-opacity-50"
        onClick={() => {
          setGameOverScreen(false);
        }}
      >
        <div className="flex flex-col">
          <Card className="p-6">
            <CardHeader>
              <div className="flex flex-col gap-4 justify-center items-center">
                <CardTitle className="text-4xl">
                  {outcome == "w"
                    ? "White Wins"
                    : outcome == "b"
                      ? "Black Wins"
                      : "Draw"}
                </CardTitle>
                <CardDescription className="text-lg">
                  by {outcomeMethod}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  const { socket, message } = useWebSocket();

  const chessRef = useRef(new Chess());

  const [boardInfo, setBoardInfo] = useState(
    chessRef.current.getBoardInfoAt(0)
  );

  const [gameStarted, setGameStarted] = useState(false);
  const [color, setColor] = useState<Color | null>(null);

  const [pieceSet, setPieceSet] = useState<PieceSet>("cardinal");
  const [gameOverScreen, setGameOverScreen] = useState(false);

  const [lastMove, setLastMove] = useState<{
    move: number[];
    notation: string;
  } | null>(null);
  const [flip, setFlip] = useState(false);
  const [dontAnimate, setDontAnimate] = useState(false);
  const [index, setIndex] = useState(0);
  const [movesMade, setMovesMade] = useState(0);

  const [animationPreference, setAnimationPreference] = useState(true);

  const canMakeMoves =
    index == movesMade &&
    chessRef.current.outcome[0] == "" &&
    gameStarted &&
    chessRef.current.currentTurn == color;

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

    if (chessRef.current.outcome[0] != "") {
      setGameOverScreen(true);
    }

    if (promoteTo) {
      socket?.send(
        JSON.stringify({
          event: "move",
          data: {
            gameId: params.id,
            move: `${Chess.position_to_algebraic(from)}${Chess.position_to_algebraic(to)}${promoteTo}`,
          },
        })
      );
    } else {
      socket?.send(
        JSON.stringify({
          event: "move",
          data: {
            gameId: params.id,
            move: `${Chess.position_to_algebraic(from)}${Chess.position_to_algebraic(to)}`,
          },
        })
      );
    }
  };

  const handleFirst = () => {
    setIndex(0);
    setBoardInfo(chessRef.current.getBoardInfoAt(0));
    setDontAnimate(true);
    setLastMove(null);
    if (gameOverScreen) {
      setGameOverScreen(false);
    }
  };
  const handlePrevious = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
      setBoardInfo(chessRef.current.getBoardInfoAt(index - 1));
      setDontAnimate(false);
      if (gameOverScreen) {
        setGameOverScreen(false);
      }
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
      if (gameOverScreen) {
        setGameOverScreen(false);
      }
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

    if (gameOverScreen) {
      setGameOverScreen(false);
    }
  };

  const goToMove = (index: number) => {
    setIndex(index + 1);
    setBoardInfo(chessRef.current.getBoardInfoAt(index + 1));
    setLastMove(chessRef.current.getMoveAt(index));
    setDontAnimate(true);

    if (gameOverScreen) {
      setGameOverScreen(false);
    }
  };

  useEffect(() => {
    socket?.send(
      JSON.stringify({
        event: "join game",
        data: {
          gameId: params.id,
        },
      })
    );
  }, []);

  useEffect(() => {
    if (message) {
      const parsedData = JSON.parse(message);

      if (parsedData.event == "total moves") {
        const moves = parsedData.data.moves as string;

        const moveList = moves.split(",");

        if (moveList.length > 1) {
          moveList.forEach((move) => {
            const from = Chess.algebraic_to_position(move.substring(0, 2));
            const to = Chess.algebraic_to_position(move.substring(2));

            if (move.length == 4) {
              chessRef.current.move(from, to);
            } else {
              chessRef.current.move(
                from,
                to,
                move.charAt(4) as Exclude<PieceType, "k" | "p">
              );
            }
          });

          setIndex(moveList.length);
          setMovesMade(moveList.length);
          setBoardInfo(chessRef.current.getBoardInfoAt(moveList.length));
          setLastMove(chessRef.current.getMoveAt(moveList.length - 1));
          setDontAnimate(true);
        }
      } else if (parsedData.event == "game started") {
        const color = parsedData.data.color;

        setColor(color);
        setGameStarted(true);
      } else if (parsedData.event == "move") {
        const moveString = parsedData.data.move as string;

        const from = Chess.algebraic_to_position(moveString.substring(0, 2));
        const to = Chess.algebraic_to_position(moveString.substring(2));
        const promoteTo =
          move.length == 5
            ? (moveString.charAt(4) as Exclude<PieceType, "k" | "p">)
            : undefined;

        chessRef.current.move(from, to, promoteTo);
        setIndex(movesMade + 1);
        setMovesMade((prev) => prev + 1);
        setBoardInfo(chessRef.current.getBoardInfoAt(movesMade + 1));
        setLastMove(chessRef.current.getMoveAt(movesMade));
        setDontAnimate(false);

        if (chessRef.current.outcome[0] != "") {
          setGameOverScreen(true);
        }
      }
    }
  }, [message]);

  return (
    <div className="min-h-[100%] flex justify-center lg:items-center bg-background p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div>
          <div className="relative aspect-square w-fit h-fit rounded-md overflow-hidden">
            {gameOverScreen && (
              <GameOverScreen
                setGameOverScreen={setGameOverScreen}
                outcome={chessRef.current.outcome[0]!}
                outcomeMethod={chessRef.current.outcome[1]!}
              />
            )}
            <ChessBoard
              pieceList={boardInfo.pieceList}
              enPassantPosition={
                boardInfo.fen.split(" ")[3]! == "-"
                  ? null
                  : Chess.algebraic_to_position(boardInfo.fen.split(" ")[3]!)
              }
              currentTurn={boardInfo.fen.split(" ")[1] as Color}
              move={move}
              dontAnimate={dontAnimate || !animationPreference}
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
                <div className="flex flex-col gap-4 pb-4 px-3 mb-4 grow max-h-[300px] lg:max-h-[600px] overflow-auto">
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
                    <span>Animations</span>
                    <div>
                      <Switch
                        checked={animationPreference}
                        onCheckedChange={(value) =>
                          setAnimationPreference(value)
                        }
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
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

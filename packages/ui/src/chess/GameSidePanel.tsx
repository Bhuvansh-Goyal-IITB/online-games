"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ui/components/ui/card";
import MoveList from "./MoveList";
import { Button, ButtonProps } from "@ui/components/ui/button";
import { useChessContext } from "../context/chessContext";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Copy,
  CopyCheck,
  Flag,
  Settings,
  Share2,
  Undo2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
} from "@ui/components/ui/dialog";
import { Switch } from "@ui/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select";
import { PieceSet } from "./types";
import { ModeToggle } from "@ui/components/mode-toggle";
import { Separator } from "@ui/components/ui/separator";
import { FC, useState } from "react";
import { ScrollArea } from "@ui/components/ui/scroll-area";
import { Textarea } from "@ui/components/ui/textarea";

interface CopyButtonProps {
  copyText: string;
}

const CopyButton: FC<CopyButtonProps> = ({ copyText }) => {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      className="w-8 h-8"
      variant="ghost"
      size="icon"
      onClick={() => {
        navigator.clipboard.writeText(copyText);
        setCopied(true);
      }}
    >
      {copied ? <CopyCheck size={20} /> : <Copy size={20} />}
    </Button>
  );
};

interface SideButtonsProps {
  onResign?: () => void;
  onDraw?: () => void;
}

const SideButtons: FC<SideButtonsProps> = ({ onResign, onDraw }) => {
  const {
    selfGame,
    playerColor,
    moveList,
    fen,
    preferences: { flip, animation, showLegalMoves, highlightMoves, pieceSet },
    undo,
    setPreferences,
    getPGN,
    resign,
  } = useChessContext();
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[80vw] lg:w-[360px] text-sm lg:text-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Settings</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 items-start px-2">
            <div className="flex w-full justify-between">
              <span>Flip</span>
              <div>
                <Switch
                  checked={flip}
                  onCheckedChange={(value) =>
                    setPreferences((prev) => ({ ...prev, flip: value }))
                  }
                />
              </div>
            </div>
            <div className="flex w-full justify-between">
              <span>Animations</span>
              <div>
                <Switch
                  checked={animation}
                  onCheckedChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      animation: value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex w-full justify-between">
              <span>Show Legal Moves</span>
              <div>
                <Switch
                  checked={showLegalMoves}
                  onCheckedChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      showLegalMoves: value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex w-full justify-between">
              <span>Highlight Moves</span>
              <div>
                <Switch
                  checked={highlightMoves}
                  onCheckedChange={(value) =>
                    setPreferences((prev) => ({
                      ...prev,
                      highlightMoves: value,
                    }))
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
                    setPreferences((prev) => ({
                      ...prev,
                      pieceSet: value as PieceSet,
                    }));
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
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4 lg:w-5 lg:h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[350px] lg:w-[420px]">
          <div className="flex flex-col gap-6 px-2">
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="text-lg">FEN</div>
                <CopyButton copyText={fen} />
              </div>
              <div className="w-full flex justify-center">
                <Textarea readOnly className="resize-none border p-2 w-full">
                  {fen}
                </Textarea>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-3 items-center">
                <div className="text-lg">PGN</div>
                <CopyButton copyText={getPGN()} />
              </div>
              <div className="w-full flex justify-center">
                <Textarea
                  readOnly
                  className="border p-2 rounded-md h-[250px] w-full"
                >
                  {getPGN()}
                </Textarea>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {selfGame ? (
        <>
          <div>
            <Button variant="outline" size="icon" onClick={undo}>
              <Undo2 className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <Button
              disabled={moveList.length < 2}
              variant="outline"
              size="icon"
              onClick={() => {
                if (!playerColor || !onResign) return;
                onResign();
                resign(playerColor);
              }}
            >
              <Flag className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
          </div>
          <div>
            <Button
              disabled={moveList.length < 2}
              variant="outline"
              size="icon"
              onClick={() => {
                if (!onDraw) return;
                onDraw();
              }}
            >
              1/2
            </Button>
          </div>
        </>
      )}
      <div>
        <ModeToggle />
      </div>
    </>
  );
};

interface GameSidePanelProps extends SideButtonsProps {}

export const GameSidePanel: FC<GameSidePanelProps> = ({ onResign, onDraw }) => {
  const { first, previous, next, last } = useChessContext();
  return (
    // <div className="flex w-full lg:w-fit h-full gap-2">
    <Card className="flex flex-col w-full lg:w-[320px] xl:w-fit h-[380px] lg:h-full">
      <CardHeader className="flex items-center">
        <div className="flex gap-4">
          <SideButtons onResign={onResign} onDraw={onDraw} />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col pt-4 justify-between flex-grow-0 h-full">
        <ScrollArea className="flex flex-col gap-4 max-h-[180px] mb-4 lg:max-h-[450px] min-[1100px]:max-h-[530px] min-[1200px]:max-h-[63vh] xl:max-h-[67vh] overflow-y-auto">
          <MoveList />
        </ScrollArea>
        <div className="flex w-full justify-center items-center gap-2">
          <Button
            className="p-4 py-2 xl:p-6 grow"
            variant="secondary"
            onClick={first}
          >
            <ChevronFirst className="w-6 h-6 xl:w-8 xl:h-8" />
          </Button>
          <Button
            className="p-4 py-2 xl:p-6 grow"
            variant="secondary"
            onClick={previous}
          >
            <ChevronLeft className="w-6 h-6 xl:w-8 xl:h-8" />
          </Button>
          <Button
            className="p-4 py-2 xl:p-6 grow"
            variant="secondary"
            onClick={next}
          >
            <ChevronRight className="w-6 h-6 xl:w-8 xl:h-8" />
          </Button>
          <Button
            className="p-4 py-2 xl:p-6 grow"
            variant="secondary"
            onClick={last}
          >
            <ChevronLast className="w-6 h-6 xl:w-8 xl:h-8" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

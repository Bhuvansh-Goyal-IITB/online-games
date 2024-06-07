import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ui/components/ui/card";
import MoveList from "./MoveList";
import { Button } from "@ui/components/ui/button";
import { useChessContext } from "./chessContext";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Copy,
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
import { FC } from "react";
import { ScrollArea } from "@ui/components/ui/scroll-area";

const SideButtons: FC = () => {
  const {
    fen,
    preferences: { flip, animation, showLegalMoves, highlightMoves, pieceSet },
    undo,
    setPreferences,
    getPGN,
  } = useChessContext();
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[360px]">
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
      <div>
        <Button variant="outline" size="icon" onClick={undo}>
          <Undo2 className="w-4 h-4 lg:w-5 lg:h-5" />
        </Button>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4 lg:w-5 lg:h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[350px] lg:w-[420px]">
          <div className="flex flex-col gap-2 px-2">
            <div className="flex gap-3 items-center">
              <div className="text-lg">FEN</div>
              <Button className="w-8 h-8" variant="ghost" size="icon">
                <Copy size={20} />
              </Button>
            </div>
            <textarea readOnly className="resize-none border p-2 w-full">
              {fen}
            </textarea>
            <div className="flex gap-3 items-center">
              <div className="text-lg">PGN</div>
              <Button className="w-8 h-8" variant="ghost" size="icon">
                <Copy size={20} />
              </Button>
            </div>
            <div className="w-full flex justify-center">
              <textarea
                readOnly
                className="border p-2 rounded-md h-[250px] w-full"
              >
                {getPGN()}
              </textarea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div>
        <ModeToggle />
      </div>
    </>
  );
};

export const GameSidePanel = () => {
  const { first, previous, next, last } = useChessContext();
  return (
    <div className="flex w-full lg:w-fit h-full gap-2">
      <Card className="flex flex-col w-full lg:w-[320px] xl:w-fit h-[380px] lg:h-full">
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>ChEsS</CardTitle>
            <div className="flex lg:hidden gap-2">
              <SideButtons />
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col pt-4 justify-between flex-grow-0 h-full">
          <ScrollArea className="flex flex-col gap-4 max-h-[180px] mb-4 lg:max-h-[450px] min-[1100px]:max-h-[530px] min-[1200px]:max-h-[630px] xl:max-h-[700px] overflow-y-auto">
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
      <div className="hidden lg:flex flex-col gap-2">
        <SideButtons />
      </div>
    </div>
  );
};

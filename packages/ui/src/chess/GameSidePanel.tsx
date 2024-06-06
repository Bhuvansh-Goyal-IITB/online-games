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
  Settings,
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

const SideButtons: FC = () => {
  const {
    undo,
    preferences: { flip, animation, showLegalMoves, highlightMoves, pieceSet },
    setPreferences,
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
      <div>
        <ModeToggle />
      </div>
    </>
  );
};

export const GameSidePanel = () => {
  const { first, previous, next, last } = useChessContext();
  return (
    <div className="flex gap-2">
      <div className="grow h-full">
        <Card className="flex flex-col h-full">
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
            <div className="flex flex-col gap-4 max-h-[180px] mb-4 lg:max-h-[450px] min-[1100px]:max-h-[530px] min-[1200px]:max-h-[630px] xl:max-h-[700px] overflow-y-auto">
              <MoveList />
            </div>
            <div className="flex justify-center items-center gap-2">
              <Button
                className="p-4 py-2 lg:p-6 grow"
                variant="secondary"
                onClick={first}
              >
                <ChevronFirst className="w-6 h-6 lg:w-8 lg:h-8" />
              </Button>
              <Button
                className="p-4 py-2 lg:p-6 grow"
                variant="secondary"
                onClick={previous}
              >
                <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
              </Button>
              <Button
                className="p-4 py-2 lg:p-6 grow"
                variant="secondary"
                onClick={next}
              >
                <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
              </Button>
              <Button
                className="p-4 py-2 lg:p-6 grow"
                variant="secondary"
                onClick={last}
              >
                <ChevronLast className="w-6 h-6 lg:w-8 lg:h-8" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden lg:flex flex-col gap-2">
        <SideButtons />
      </div>
    </div>
  );
};

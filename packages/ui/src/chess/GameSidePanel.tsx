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

export const GameSidePanel = () => {
  const {
    first,
    previous,
    next,
    last,
    undo,
    preferences: { flip, animation, showValidMoves, pieceSet },
    setPreferences,
  } = useChessContext();
  return (
    <div className="flex gap-2 h-full">
      <div className="grow h-full">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Move History</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full grow">
            <div className="flex flex-col gap-4 pb-4 px-3 mb-4 grow max-h-[300px] lg:max-h-[600px] overflow-auto">
              <div>
                <MoveList />
              </div>
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
                      setPreferences((prev) => ({ ...prev, animation: value }))
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
            <Undo2 className="w-5 h-5" />
          </Button>
        </div>
        <div>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ui/components/ui/card";
import { Unplug } from "lucide-react";
import { FC } from "react";

interface AbortClockProps {
  time: number;
}

export const AbortClock: FC<AbortClockProps> = ({ time }) => {
  return (
    <Card>
      <CardContent className="p-2 px-4 flex items-center">
        <div className="flex gap-2">
          <div className="md:hidden">
            <Unplug className="size-4" />
          </div>
          <div className="hidden md:inline text-xs text-muted-foreground max-w-[4rem]">
            Game will abort in
          </div>
          <div className="text-xs md:text-sm flex justify-center items-center">
            {Math.floor(time / 60)} : {(time % 60).toString().padStart(2, "0")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

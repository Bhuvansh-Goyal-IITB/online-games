import { Card, CardHeader, CardTitle } from "@ui/components/ui/card";
import { FC } from "react";

interface ClockProps {
  time: number;
  title?: string;
}

export const Clock: FC<ClockProps> = ({ time, title }) => {
  return (
    <Card className="py-1">
      <CardHeader className="py-1">
        {title && <CardTitle>{title}</CardTitle>}
        {Math.floor(time / 60)} : {(time % 60).toString().padStart(2, "0")}
      </CardHeader>
    </Card>
  );
};

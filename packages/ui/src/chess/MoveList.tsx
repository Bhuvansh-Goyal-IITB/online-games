import { Button } from "@ui/components/ui/button";

function MoveList({
  moveList,
  currentIndex,
  goToMove,
}: {
  moveList: string[];
  currentIndex: number;
  goToMove: (moveIndex: number) => void;
}) {
  return (
    <div className="grid grid-cols-7 w-full h-full gap-2">
      {moveList.map((move, index) =>
        index % 2 == 0 ? (
          <>
            <span>{index / 2 + 1}.</span>
            <div className="col-span-3">
              <Button
                variant="link"
                className={currentIndex - 1 == index ? "bg-secondary" : ""}
                onClick={() => goToMove(index)}
              >
                {move}
              </Button>
            </div>
          </>
        ) : (
          <div className="col-span-3">
            <Button
              variant="link"
              className={currentIndex - 1 == index ? "bg-secondary" : ""}
              onClick={() => goToMove(index)}
            >
              {move}
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export default MoveList;

import { Button } from "@ui/components/ui/button";

function MoveList({
  moveList,
  currentIndex,
  goToMove,
}: {
  moveList: string[][];
  currentIndex: number;
  goToMove: (moveIndex: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4 pb-4 mt-6 grow">
      {moveList.map(([white_move, black_move], index) => {
        return (
          <div key={index} className="flex items-center gap-12">
            <span>{index + 1}.</span>
            {white_move && (
              <Button
                variant="link"
                className={currentIndex - 1 == index * 2 ? "bg-secondary" : ""}
                onClick={() => goToMove(index * 2)}
              >
                {white_move}
              </Button>
            )}
            {black_move && (
              <Button
                variant="link"
                className={
                  currentIndex - 1 == index * 2 + 1 ? "bg-secondary" : ""
                }
                onClick={() => goToMove(index * 2 + 1)}
              >
                {black_move}
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MoveList;

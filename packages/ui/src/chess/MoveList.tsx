import { Button } from "@ui/components/ui/button";

function MoveList({
  moveList,
  currentIndex,
}: {
  moveList: string[][];
  currentIndex: number;
}) {
  console.log(currentIndex);
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

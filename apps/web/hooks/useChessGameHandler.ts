import { IPlayerInfo } from "@repo/ui/chess/ChessContextProvider";
import { useChessContext } from "@repo/ui/context/chessContext";
import { useSocketContext } from "@repo/ui/context/socketContext";
import { useEffect, useRef, useState } from "react";
import { toast } from "@repo/ui/components/ui/sonner";

export const useChessGameHandler = (gameId: string) => {
  const {
    moveList,
    playerColor,
    lastMove,
    movePiece,
    loadMoves,
    setCurrentPlayerColor,
    setWhitePlayerInfo,
    setBlackPlayerInfo,
    startGame,
    setPreferences,
    resign,
    timeout,
    abandon,
    draw,
  } = useChessContext();
  const { sendMessage, on, authorized, user } = useSocketContext();
  const [loading, setLoading] = useState(true);
  const [movesMade, setMovesMade] = useState(0);
  const [timeData, setTimeData] = useState({
    w: 300,
    b: 300,
  });
  const [abortData, setAbortData] = useState<{
    leftPlayer: "w" | "b";
    time: number;
  } | null>(null);

  const joinReqSent = useRef(false);

  useEffect(() => {
    if (moveList.length != movesMade) {
      setMovesMade(moveList.length);

      if (moveList.length > 0) {
        if (
          ((playerColor == "w" && moveList.length % 2 != 0) ||
            (playerColor == "b" && moveList.length % 2 == 0)) &&
          lastMove
        ) {
          sendMessage("move", {
            gameId,
            move: lastMove.moveString,
          });
        }
      }
    }
  }, [moveList]);

  useEffect(() => {
    if (authorized && !joinReqSent.current) {
      sendMessage("join game", { gameId });
      joinReqSent.current = true;
    }
  }, [authorized]);

  on("game started", (data) => {
    const { color, opponentData } = data as {
      color: "w" | "b";
      opponentData: { name: string; image?: string };
    };

    setCurrentPlayerColor(color);
    if (color == "b") {
      setPreferences((prev) => ({ ...prev, flip: true }));
    }

    if (!user) {
      if (color == "w") {
        setWhitePlayerInfo({
          name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
        });
        setBlackPlayerInfo({ ...opponentData });
      } else {
        setBlackPlayerInfo({
          name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
        });
        setWhitePlayerInfo({ ...opponentData });
      }
    } else {
      if (color == "w") {
        setWhitePlayerInfo({
          name: user.name!,
          image: user.image ?? undefined,
        });
        setBlackPlayerInfo({ ...opponentData });
      } else {
        setBlackPlayerInfo({
          name: user.name!,
          image: user.image ?? undefined,
        });
        setWhitePlayerInfo({ ...opponentData });
      }
    }

    setLoading(false);
    startGame();
  });

  on("game joined", (data) => {
    const { color } = data as { color: "w" | "b" };

    setCurrentPlayerColor(color);
    if (color == "b") {
      setPreferences((prev) => ({ ...prev, flip: true }));
    }

    if (!user) {
      if (color == "w") {
        setWhitePlayerInfo({
          name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
        });
      } else {
        setBlackPlayerInfo({
          name: `Guest${localStorage.getItem("id")!.substring(0, 10)}`,
        });
      }
    } else {
      if (color == "w") {
        setWhitePlayerInfo({
          name: user.name!,
          image: user.image ?? undefined,
        });
      } else {
        setBlackPlayerInfo({
          name: user.name!,
          image: user.image ?? undefined,
        });
      }
    }

    setLoading(false);
  });

  on("total moves", (data) => {
    const moves = data.moves as string;
    if (moves != "") loadMoves(moves.split(","));
  });

  on("move", (data) => {
    const { move: moveString } = data as { move: string };
    movePiece(moveString, false);
  });

  on("resign", (data) => {
    const { color } = data as { color: "w" | "b" };
    resign(color);
  });

  on("draw offer", (_data) => {
    toast("Opponent offered a draw", {
      action: {
        label: "Accept",
        onClick: () => {
          sendMessage("draw accept", { gameId });
        },
      },
      cancel: {
        label: "Reject",
        onClick: () => {
          sendMessage("draw reject", { gameId });
        },
      },
    });
  });

  on("draw reject", (_data) => {
    toast("Opponent rejected the draw offer");
  });

  on("draw accept", (_data) => {
    draw();
  });

  on("time", (data) => {
    const newTimeData = data as { w: number; b: number };

    if (newTimeData.w == 0) {
      timeout("w");
    } else if (newTimeData.b == 0) {
      timeout("b");
    }

    if (abortData && abortData.time > 0) {
      setAbortData({ ...abortData, time: abortData.time - 1 });
    }

    setTimeData(newTimeData);
  });

  on("player left", (data) => {
    const { tag } = data as { tag: "w" | "b" };

    toast("Opponent Left");
    setAbortData({
      leftPlayer: tag,
      time: 60,
    });
  });

  on("player rejoined", (_data) => {
    toast("Opponent Rejoined");
    setAbortData(null);
  });

  on("game aborted", (data) => {
    const { tag } = data as { tag: "w" | "b" };
    abandon(tag);
  });

  const onResign = () => {
    sendMessage("resign", {
      gameId,
    });
  };

  const onDraw = () => {
    sendMessage("draw offer", {
      gameId,
    });
  };

  return { loading, onResign, onDraw, timeData, abortData };
};

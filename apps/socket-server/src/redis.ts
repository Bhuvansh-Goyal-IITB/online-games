import { Redis } from "ioredis";
import { PlayerInfo } from "./types.js";
import { createId } from "@paralleldrive/cuid2";
import { GameObject } from "./game-object.js";

export const redis = new Redis(process.env.REDIS_CONNECTION_URL!);

export const getGame = (gameId: string) => {
  return redis.hgetall(gameId);
};

export const removeGame = async (gameId: string) => {
  await redis.del(gameId);
};

export const addPlayerToRedisData = (
  redisData: Record<string, string>,
  { id, name, image }: PlayerInfo,
): Record<string, string> => {
  const changeObject: Record<string, string> = {};
  if (!redisData["white:id"] && !redisData["black:id"]) {
    const color = Math.random() > 0.5 ? "white" : "black";
    changeObject[`${color}:id`] = id;
    changeObject[`${color}:name`] = name;
    if (image) changeObject[`${color}:image`] = image;
  } else if (!redisData["white:id"]) {
    changeObject["white:id"] = id;
    changeObject["white:name"] = name;
    if (image) changeObject["white:image"] = image;
  } else if (!redisData["black:id"]) {
    changeObject["black:id"] = id;
    changeObject["black:name"] = name;
    if (image) changeObject["black:image"] = image;
  }

  return changeObject;
};

export const createGame = async (
  p1: PlayerInfo,
  p2: PlayerInfo,
): Promise<string> => {
  const gameId = createId();
  let redisData: Record<string, string> = {
    ...GameObject.generateInitialState(),
  };

  const changeP1 = addPlayerToRedisData(redisData, { ...p1 });
  redisData = { ...redisData, ...changeP1 };
  const changeP2 = addPlayerToRedisData(redisData, { ...p2 });
  redisData = { ...redisData, ...changeP2 };

  await redis.hset(gameId, redisData);
  return gameId;
};

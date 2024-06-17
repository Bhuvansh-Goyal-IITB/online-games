import { z } from "zod";

export const moveDataSchema = z.object({
  move: z.string(),
  gameId: z.string(),
});

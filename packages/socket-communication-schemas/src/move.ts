import { z } from "zod";

export const moveDataSchema = z.object({
  gameId: z.string(),
  move: z.string(),
});

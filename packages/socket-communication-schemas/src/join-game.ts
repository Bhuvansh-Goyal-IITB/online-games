import { z } from "zod";

export const joinGameDataSchema = z.object({
  gameId: z.string(),
});

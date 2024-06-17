import { z } from "zod";

export const gameIdDataSchema = z.object({
  gameId: z.string(),
});

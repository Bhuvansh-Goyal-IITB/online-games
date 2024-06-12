import { z } from "zod";

export const authDataSchema = z.object({
  id: z.string(),
  isGuest: z.boolean(),
});

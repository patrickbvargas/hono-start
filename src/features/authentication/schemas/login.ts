import * as z from "zod";

export const loginOrganizationCountSchema = z.number().int().nonnegative();

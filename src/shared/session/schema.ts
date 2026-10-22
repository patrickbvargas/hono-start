import * as z from "zod";
import { clerkPermissionSchema } from "./catalog";

const sessionOptionSchema = z.object({
	id: z.number().int(),
	value: z.string(),
	label: z.string(),
});

export const clerkIdentitySchema = z.object({
	userId: z.string().startsWith("user_"),
	organizationId: z.string().startsWith("org_"),
	sessionId: z.string().startsWith("sess_"),
});

export const loggedUserSessionSchema = z.object({
	user: z.object({
		id: z.number().int(),
		fullName: z.string(),
		email: z.email(),
	}),
	employee: z.object({ id: z.number().int() }),
	firm: z.object({ id: z.number().int(), name: z.string() }),
	employeeType: sessionOptionSchema,
	role: sessionOptionSchema,
	mustChangePassword: z.literal(false),
	clerk: clerkIdentitySchema,
	permissions: z.array(clerkPermissionSchema),
});

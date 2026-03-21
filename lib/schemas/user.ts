import { z } from "zod";

export const UserSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(6),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export type UserRow = z.infer<typeof UserSchema>;

export const UserCreateSchema = z.object({
	name: z.string().min(1),
	email: z.email(),
	password: z.string().min(6),
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;

export const UserPublicSchema = UserSchema.omit({ password: true });

export type UserPublic = z.infer<typeof UserPublicSchema>;

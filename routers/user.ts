import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import {
	ACCESS_TOKEN_COOKIE_NAME,
	getAccessTokenCookieOptions,
	signAccessToken,
} from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { UserCreateSchema, UserPublicSchema } from "../lib/schemas";
import { UserSignInSchema } from "../lib/schemas/user";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

const userPublicSelect = {
	id: true,
	name: true,
	email: true,
	createdAt: true,
	updatedAt: true,
} as const;

router.post("/signup", async (req, res, next) => {
	const body = UserCreateSchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json({
			message: "Invalid body",
			errors: z.treeifyError(body.error),
		});
	}

	try {
		const hashedPassword = await bcrypt.hash(
			body.data.password,
			await bcrypt.genSalt(10),
		);
		const created = await prisma.user.create({
			data: {
				...body.data,
				password: hashedPassword,
			},
			select: userPublicSelect,
		});

		const out = UserPublicSchema.safeParse(created);
		if (!out.success) {
			return res.status(500).json({ message: "Response validation failed" });
		}

		const token = signAccessToken({
			sub: created.id,
			email: created.email,
		});

		res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, getAccessTokenCookieOptions());

		return res.status(201).json({
			user: out.data,
			token,
			tokenType: "Bearer",
		});
	} catch (error) {
		next(error);
	}
});

router.post("/signin", async (req, res, next) => {
	const body = UserSignInSchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json({
			message: "Invalid body",
			errors: z.treeifyError(body.error),
		});
	}

	try {
		const user = await prisma.user.findUnique({
			where: { email: body.data.email },
		});
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const isPasswordValid = await bcrypt.compare(
			body.data.password,
			user.password,
		);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = signAccessToken({
			sub: user.id,
			email: user.email,
		});

		res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, getAccessTokenCookieOptions());

		return res.status(200).json({
			user: UserPublicSchema.parse(user),
			token,
			tokenType: "Bearer",
		});
	} catch (error) {
		next(error);
	}
});

router.get("/me", authMiddleware, async (req, res, _next) => {
	return res.status(200).json({
		user: req.auth,
	});
});

export default router;
export type UserRouter = typeof router;

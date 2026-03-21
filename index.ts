import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import morgan from "morgan";
import { z } from "zod";
import { prisma } from "./lib/prisma";
import { UserCreateSchema, UserPublicSchema } from "./lib/schemas";

const app = express();
app.use(express.json());
app.use(morgan("dev"));

const userPublicSelect = {
	id: true,
	name: true,
	email: true,
	createdAt: true,
	updatedAt: true,
} as const;

app.get("/users", async (_req, res, next) => {
	try {
		const users = await prisma.user.findMany({ select: userPublicSelect });
		const parsed = z.array(UserPublicSchema).safeParse(users);
		if (!parsed.success) {
			return res.status(500).json({ message: "Response validation failed" });
		}
		res.json(parsed.data);
	} catch (error) {
		next(error);
	}
});

app.post("/users", async (req, res, next) => {
	const body = UserCreateSchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json({
			message: "Invalid body",
			errors: z.treeifyError(body.error),
		});
	}

	try {
		const created = await prisma.user.create({
			data: body.data,
			select: userPublicSelect,
		});

		const out = UserPublicSchema.safeParse(created);
		if (!out.success) {
			return res.status(500).json({ message: "Response validation failed" });
		}
		return res.status(201).json(out.data);
	} catch (error) {
		next(error);
	}
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
	if (error instanceof PrismaClientKnownRequestError) {
		switch (error.code) {
			case "P2002":
				return res.status(409).json({
					message: "Unique constraint failed.",
					field: error.meta?.target,
				});
			default:
				return res.status(400).json({
					message: "Database request failed.",
					code: error.code,
				});
		}
	}

	console.error(error);
	res.status(500).json({ message: "Internal server error" });
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});

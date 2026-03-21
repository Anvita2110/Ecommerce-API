import "dotenv/config";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import cookieParser from "cookie-parser";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import morgan from "morgan";
import userRouter from "./routers/user";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/users", userRouter);

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

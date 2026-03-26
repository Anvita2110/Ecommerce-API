import "dotenv/config";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import cookieParser from "cookie-parser";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import morgan from "morgan";
import redisRateLimit from "./middlewares/rate-limit";
import userRouter from "./routers/user";
import productRouter from "./routers/product";

const PORT = Number(process.env.PORT || 3000);

const app = express();
app.set("trust proxy", 1);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(redisRateLimit);
app.use("/users", userRouter);
app.use("/products", productRouter);

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

app.get("/", (_req, res) => {
	res.send("Ecommerce API is running");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

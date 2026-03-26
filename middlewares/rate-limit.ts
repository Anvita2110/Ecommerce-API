import type { NextFunction, Request, Response } from "express";
import { redis } from "../lib/redis";

const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? 60);
const WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? 60);

export async function redisRateLimit(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (!redis) {
		return next();
	}

	const ip = req.ip || req.socket.remoteAddress || "unknown";
	const key = `rate_limit:${ip}`;

	try {
		const count = await redis.incr(key);
		if (count === 1) {
			await redis.expire(key, WINDOW_SECONDS);
		}

		res.setHeader("X-RateLimit-Limit", String(MAX_REQUESTS));
		res.setHeader(
			"X-RateLimit-Remaining",
			String(Math.max(MAX_REQUESTS - count, 0)),
		);

		if (count > MAX_REQUESTS) {
			return res.status(429).json({ message: "Too many requests" });
		}

		next();
	} catch (error) {
		console.error("Rate limit failed:", error);
		next();
	}
}

export default redisRateLimit;

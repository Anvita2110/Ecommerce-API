import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

export const redis =
	redisUrl == null || redisUrl === ""
		? null
		: createClient({
				url: redisUrl,
			});

if (redis) {
	redis.on("error", (error) => {
		console.error("Redis error:", error);
	});

	await redis.connect();
}

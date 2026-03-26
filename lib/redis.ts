import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const isSecureRedisUrl =
	typeof redisUrl === "string" && redisUrl.startsWith("rediss://");

export const redis =
	redisUrl == null || redisUrl === ""
		? null
		: isSecureRedisUrl
			? createClient({
					url: redisUrl,
					socket: {
						tls: true,
					},
				})
			: createClient({
					url: redisUrl,
				});

if (redis) {
	redis.on("error", (error) => {
		console.error("Redis error:", error);
	});

	await redis.connect();
}

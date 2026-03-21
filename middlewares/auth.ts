import type { NextFunction, Request, Response } from "express";
import {
	ACCESS_TOKEN_COOKIE_NAME,
	type AccessTokenPayload,
	verifyAccessToken,
} from "../lib/jwt";

function getBearerToken(authorization: string | undefined): string | undefined {
	if (!authorization?.startsWith("Bearer ")) {
		return undefined;
	}
	const value = authorization.slice("Bearer ".length).trim();
	return value || undefined;
}

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const token =
		req.cookies?.[ACCESS_TOKEN_COOKIE_NAME] ??
		getBearerToken(req.headers.authorization);

	if (!token) {
		return res.status(401).json({ message: "Unauthorized" });
	}

	let payload: AccessTokenPayload;
	try {
		payload = verifyAccessToken(token);
	} catch {
		return res.status(401).json({ message: "Unauthorized" });
	}

	req.auth = payload;
	next();
}

export default authMiddleware;
export type AuthMiddleware = typeof authMiddleware;

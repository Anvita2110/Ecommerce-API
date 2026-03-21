import type { CookieOptions } from "express";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

/** Cookie name for the JWT (readable by `cookie-parser`). */
export const ACCESS_TOKEN_COOKIE_NAME =
	process.env.ACCESS_TOKEN_COOKIE_NAME ?? "access_token";

export type AccessTokenPayload = {
	sub: string;
	email: string;
};

function getSecret(): string {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET is not set");
	}
	return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
	const options: SignOptions = {
		expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
	};
	return jwt.sign(
		{ sub: payload.sub, email: payload.email },
		getSecret(),
		options,
	);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
	const decoded = jwt.verify(token, getSecret()) as JwtPayload &
		AccessTokenPayload;
	if (typeof decoded.sub !== "string" || typeof decoded.email !== "string") {
		throw new Error("Invalid token payload");
	}
	return { sub: decoded.sub, email: decoded.email };
}

export function getAccessTokenCookieOptions(): CookieOptions {
	return {
		httpOnly: true,
		secure: process.env.BUN_ENV === "production",
		sameSite: "lax",
		maxAge: 1 * 24 * 60 * 60 * 1000,
		path: "/",
	};
}

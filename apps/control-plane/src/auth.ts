import { createRemoteJWKSet, jwtVerify } from "jose";

import type { Env } from "./types";

const accessJwtHeader = "CF-Access-Jwt-Assertion";

const required = (value: string | undefined, label: string) => {
	if (!value?.trim()) {
		throw new Error(`Missing required env var: ${label}`);
	}
	return value.trim();
};

const getAccessJwt = (request: Request) =>
	request.headers.get(accessJwtHeader)?.trim() || undefined;

const getAccessJwks = (env: Env) => {
	const teamDomain = required(env.ACCESS_TEAM_DOMAIN, "ACCESS_TEAM_DOMAIN");
	return createRemoteJWKSet(
		new URL(
			"/cdn-cgi/access/certs",
			`${teamDomain.endsWith("/") ? teamDomain : `${teamDomain}/`}`,
		),
	);
};

export const verifyAccessJwt = async (request: Request, env: Env) => {
	const token = getAccessJwt(request);
	if (!token) {
		return false;
	}

	try {
		const teamDomain = required(env.ACCESS_TEAM_DOMAIN, "ACCESS_TEAM_DOMAIN");
		const audience = required(env.ACCESS_AUD, "ACCESS_AUD");
		const jwks = getAccessJwks(env);
		await jwtVerify(token, jwks, {
			issuer: teamDomain,
			audience,
		});
		return true;
	} catch {
		return false;
	}
};

export const hasAccessJwt = (request: Request) =>
	Boolean(getAccessJwt(request));

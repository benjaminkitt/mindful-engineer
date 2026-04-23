import { createRemoteJWKSet, jwtVerify } from "jose";

import type { Env } from "./types";

const accessJwtHeader = "CF-Access-Jwt-Assertion";
const accessJwksByTeamDomain = new Map<
	string,
	ReturnType<typeof createRemoteJWKSet>
>();

const required = (value: string | undefined, label: string) => {
	if (!value?.trim()) {
		throw new Error(`Missing required env var: ${label}`);
	}
	return value.trim();
};

const normalizeTeamDomain = (teamDomain: string) =>
	teamDomain.endsWith("/") ? teamDomain : `${teamDomain}/`;

const getAccessJwt = (request: Request) =>
	request.headers.get(accessJwtHeader)?.trim() || undefined;

export const getAccessJwks = (teamDomain: string) => {
	const normalizedTeamDomain = normalizeTeamDomain(teamDomain);
	const cached = accessJwksByTeamDomain.get(normalizedTeamDomain);
	if (cached) {
		return cached;
	}

	const jwks = createRemoteJWKSet(
		new URL("/cdn-cgi/access/certs", normalizedTeamDomain),
	);
	accessJwksByTeamDomain.set(normalizedTeamDomain, jwks);
	return jwks;
};

export const verifyAccessJwt = async (request: Request, env: Env) => {
	const token = getAccessJwt(request);
	if (!token) {
		return false;
	}

	try {
		const teamDomain = required(env.ACCESS_TEAM_DOMAIN, "ACCESS_TEAM_DOMAIN");
		const audience = required(env.ACCESS_AUD, "ACCESS_AUD");
		const jwks = getAccessJwks(teamDomain);
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

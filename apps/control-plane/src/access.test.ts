import { strict as assert } from "node:assert";
import test from "node:test";

import { getAccessJwks, hasAccessJwt, verifyAccessJwt } from "./auth";
import type { Env } from "./types";

const baseEnv = {
	DB: {} as Env["DB"],
	ACCESS_PROTECTION_MODE: "cloudflare-access",
	ACCESS_TEAM_DOMAIN: "https://team.example.cloudflareaccess.com",
	ACCESS_AUD: "audience-tag",
} satisfies Env;

test("hasAccessJwt detects the Cloudflare Access JWT header", () => {
	const request = new Request("https://example.com/admin", {
		headers: {
			"CF-Access-Jwt-Assertion": "token",
		},
	});

	assert.equal(hasAccessJwt(request), true);
	assert.equal(hasAccessJwt(new Request("https://example.com/admin")), false);
});

test("verifyAccessJwt returns false when the JWT is missing", async () => {
	const request = new Request("https://example.com/admin");
	assert.equal(await verifyAccessJwt(request, baseEnv), false);
});

test("verifyAccessJwt returns false when verification fails", async () => {
	const request = new Request("https://example.com/admin", {
		headers: {
			"CF-Access-Jwt-Assertion": "not-a-jwt",
		},
	});

	assert.equal(await verifyAccessJwt(request, baseEnv), false);
});

test("getAccessJwks memoizes the remote JWKS loader per team domain", () => {
	const teamDomain = "https://team.example.cloudflareaccess.com";
	const sameDomainWithSlash = "https://team.example.cloudflareaccess.com/";
	const otherDomain = "https://other.example.cloudflareaccess.com";

	const first = getAccessJwks(teamDomain);
	const second = getAccessJwks(sameDomainWithSlash);
	const third = getAccessJwks(otherDomain);

	assert.equal(first, second);
	assert.notEqual(first, third);
});

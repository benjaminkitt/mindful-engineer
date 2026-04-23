import type { CanonicalArtifact, Env, GitHubPublishResult } from "./types";

interface GithubContentGetResponse {
	sha: string;
}

interface GithubCreateOrUpdateResponse {
	content: {
		path: string;
	};
	commit: {
		sha: string;
		html_url?: string;
	};
}

const toBase64Utf8 = (value: string) => {
	const bytes = new TextEncoder().encode(value);
	const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
		"",
	);
	return btoa(binString);
};

const required = (value: string | undefined, label: string) => {
	if (!value?.trim()) {
		throw new Error(`Missing required env var: ${label}`);
	}
	return value.trim();
};

const buildApiUrl = (env: Env, path: string) => {
	const base = env.GITHUB_API_BASE_URL?.trim() || "https://api.github.com";
	return new URL(path, `${base.endsWith("/") ? base : `${base}/`}`).toString();
};

const getRepoCoordinates = (env: Env) => {
	const owner = required(env.GITHUB_OWNER, "GITHUB_OWNER");
	const repo = required(env.GITHUB_REPO, "GITHUB_REPO");
	const token = required(env.GITHUB_TOKEN, "GITHUB_TOKEN");
	const branch = env.GITHUB_BRANCH?.trim() || "main";
	const contentRoot =
		env.GITHUB_CONTENT_ROOT?.trim() || "apps/public-site/src/content";

	return { owner, repo, token, branch, contentRoot };
};

const githubHeaders = (token: string) => ({
	Authorization: `Bearer ${token}`,
	Accept: "application/vnd.github+json",
	"User-Agent": "mindful-engineer-control-plane",
	"X-GitHub-Api-Version": "2022-11-28",
});

const getExistingSha = async (
	env: Env,
	coords: ReturnType<typeof getRepoCoordinates>,
	path: string,
) => {
	const url = buildApiUrl(
		env,
		`repos/${coords.owner}/${coords.repo}/contents/${path}?ref=${encodeURIComponent(coords.branch)}`,
	);

	const response = await fetch(url, {
		headers: githubHeaders(coords.token),
	});

	if (response.status === 404) {
		return undefined;
	}

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(
			`Failed to read existing GitHub content (${response.status}): ${detail}`,
		);
	}

	const payload = (await response.json()) as GithubContentGetResponse;
	return payload.sha;
};

export const publishCanonicalArtifact = async (
	env: Env,
	artifact: CanonicalArtifact,
	message: string,
): Promise<GitHubPublishResult> => {
	const coords = getRepoCoordinates(env);
	const fullPath = `${coords.contentRoot}/${artifact.relativePath}`;
	const existingSha = await getExistingSha(env, coords, fullPath);

	const body = {
		message,
		content: toBase64Utf8(artifact.mdx),
		branch: coords.branch,
		sha: existingSha,
		committer: {
			name: "Mindful Engineer Control Plane",
			email: "noreply@mindful.engineer",
		},
	};

	const url = buildApiUrl(
		env,
		`repos/${coords.owner}/${coords.repo}/contents/${fullPath}`,
	);

	const response = await fetch(url, {
		method: "PUT",
		headers: {
			...githubHeaders(coords.token),
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const detail = await response.text();
		throw new Error(
			`Failed to publish content to GitHub (${response.status}): ${detail}`,
		);
	}

	const payload = (await response.json()) as GithubCreateOrUpdateResponse;

	return {
		commitSha: payload.commit.sha,
		commitUrl: payload.commit.html_url,
		contentPath: payload.content.path,
	};
};

export const getRepositoryLabel = (env: Env) => {
	const owner = required(env.GITHUB_OWNER, "GITHUB_OWNER");
	const repo = required(env.GITHUB_REPO, "GITHUB_REPO");
	return `${owner}/${repo}`;
};

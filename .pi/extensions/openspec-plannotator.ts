/**
 * OpenSpec-Plannotator bridge extension.
 *
 * Bridges OpenSpec-generated artifacts (proposal.md, design.md, tasks.md)
 * with Plannotator's visual annotation UI for interactive review.
 *
 * Commands:
 *   /opsx-review [change-name] [artifact] — open artifact in Plannotator UI
 *
 * Auto-notification:
 *   Notifies when write/edit touches openspec/changes/*\/tasks.md
 */

import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import os from "node:os";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

// ── HTTP Server Helpers ────────────────────────────────────────────────────

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk: string) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

function jsonRes(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function htmlRes(res: ServerResponse, content: string): void {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(content);
}

function listenOnRandomPort(server: Server): number {
  server.listen(0);
  const addr = server.address() as { port: number };
  return addr.port;
}

// ── Open Browser ───────────────────────────────────────────────────────────

function openBrowser(url: string): void {
  try {
    const browser = process.env.PLANNOTATOR_BROWSER || process.env.BROWSER;
    const platform = process.platform;
    const wsl =
      platform === "linux" && os.release().toLowerCase().includes("microsoft");

    if (browser) {
      if (process.env.PLANNOTATOR_BROWSER && platform === "darwin") {
        execSync(`open -a ${JSON.stringify(browser)} ${JSON.stringify(url)}`, {
          stdio: "ignore",
        });
      } else if (platform === "win32" || wsl) {
        execSync(
          `cmd.exe /c start "" ${JSON.stringify(browser)} ${JSON.stringify(url)}`,
          { stdio: "ignore" },
        );
      } else {
        execSync(`${JSON.stringify(browser)} ${JSON.stringify(url)}`, {
          stdio: "ignore",
        });
      }
    } else if (platform === "win32" || wsl) {
      execSync(`cmd.exe /c start "" ${JSON.stringify(url)}`, {
        stdio: "ignore",
      });
    } else if (platform === "darwin") {
      execSync(`open ${JSON.stringify(url)}`, { stdio: "ignore" });
    } else {
      execSync(`xdg-open ${JSON.stringify(url)}`, { stdio: "ignore" });
    }
  } catch {
    // Silently fail — non-fatal if browser can't be opened
  }
}

// ── Annotation Server ──────────────────────────────────────────────────────

interface AnnotateServerResult {
  port: number;
  url: string;
  waitForDecision: () => Promise<{ feedback: string }>;
  stop: () => void;
}

function startAnnotateServer(options: {
  markdown: string;
  filePath: string;
  htmlContent: string;
  origin?: string;
}): AnnotateServerResult {
  let resolveDecision!: (result: { feedback: string }) => void;
  const decisionPromise = new Promise<{ feedback: string }>((r) => {
    resolveDecision = r;
  });

  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, `http://localhost`);

    if (url.pathname === "/api/plan" && req.method === "GET") {
      jsonRes(res, {
        plan: options.markdown,
        origin: options.origin ?? "pi",
        mode: "annotate",
        filePath: options.filePath,
      });
    } else if (url.pathname === "/api/feedback" && req.method === "POST") {
      const body = await parseBody(req);
      resolveDecision({ feedback: (body.feedback as string) || "" });
      jsonRes(res, { ok: true });
    } else if (url.pathname === "/api/approve" && req.method === "POST") {
      const body = await parseBody(req);
      resolveDecision({ feedback: (body.feedback as string) || "" });
      jsonRes(res, { ok: true });
    } else if (url.pathname === "/api/deny" && req.method === "POST") {
      const body = await parseBody(req);
      resolveDecision({ feedback: (body.feedback as string) || "Review closed." });
      jsonRes(res, { ok: true });
    } else {
      htmlRes(res, options.htmlContent);
    }
  });

  const port = listenOnRandomPort(server);

  return {
    port,
    url: `http://localhost:${port}`,
    waitForDecision: () => decisionPromise,
    stop: () => server.close(),
  };
}

// ── Find plannotator.html ──────────────────────────────────────────────────

function findPlannotatorHtml(): string {
  const candidates: string[] = [];

  // 1. npm root -g → @plannotator/pi-extension/plannotator.html
  try {
    const npmRoot = execSync("npm root -g", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    candidates.push(
      join(npmRoot, "@plannotator", "pi-extension", "plannotator.html"),
    );
  } catch {
    // npm not available or failed
  }

  // 2. macOS Homebrew fallback
  candidates.push(
    "/opt/homebrew/lib/node_modules/@plannotator/pi-extension/plannotator.html",
  );

  for (const p of candidates) {
    try {
      if (existsSync(p)) {
        return readFileSync(p, "utf-8");
      }
    } catch {
      // continue to next candidate
    }
  }

  return "";
}

// ── OpenSpec Helpers ───────────────────────────────────────────────────────

const ARTIFACTS = ["tasks.md", "design.md", "proposal.md"] as const;
type Artifact = (typeof ARTIFACTS)[number];

function getOpenSpecChangesDir(cwd: string): string {
  return join(cwd, "openspec", "changes");
}

function getActiveChanges(cwd: string): string[] {
  const changesDir = getOpenSpecChangesDir(cwd);
  if (!existsSync(changesDir)) return [];

  try {
    return readdirSync(changesDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== "archive")
      .map((e) => e.name)
      .sort();
  } catch (err) {
    console.error("[openspec-plannotator] getActiveChanges failed:", err);
    return [];
  }
}

function getAvailableArtifacts(cwd: string, changeName: string): Artifact[] {
  const changeDir = join(getOpenSpecChangesDir(cwd), changeName);
  return ARTIFACTS.filter((a) => existsSync(join(changeDir, a)));
}

/** Returns true if the given file path is an OpenSpec tasks.md */
function matchesTasksPattern(filePath: string): boolean {
  return /openspec[/\\]changes[/\\][^/\\]+[/\\]tasks\.md$/.test(filePath);
}

// ── Extension Entry Point ──────────────────────────────────────────────────

export default function openspecPlannotator(pi: ExtensionAPI): void {
  const planHtmlContent = findPlannotatorHtml();

  if (!planHtmlContent) {
    console.warn(
      "[openspec-plannotator] plannotator.html not found. " +
        "Install @plannotator/pi-extension globally: npm install -g @plannotator/pi-extension",
    );
  }

  // Throttle state for auto-notifications
  let lastNotifyTime = 0;
  let pendingTasksNotify = false;
  const NOTIFY_COOLDOWN_MS = 30_000;

  // ── /opsx-review command ───────────────────────────────────────────────

  pi.registerCommand("opsx-review", {
    description:
      "Review an OpenSpec artifact (tasks.md, design.md, proposal.md) in Plannotator UI",
    handler: async (args, ctx) => {
      if (!planHtmlContent) {
        ctx.ui.notify(
          "OpenSpec Review: Plannotator HTML not found.\n" +
            "Install: npm install -g @plannotator/pi-extension",
          "error",
        );
        return;
      }

      const parts = (args ?? "").trim().split(/\s+/).filter(Boolean);
      let changeName = parts[0] as string | undefined;
      let artifactName = parts[1] as Artifact | undefined;

      const activeChanges = getActiveChanges(ctx.cwd);
      if (activeChanges.length === 0) {
        ctx.ui.notify(
          "OpenSpec Review: No active changes found in openspec/changes/.\n" +
            "Run /opsx:propose to create a change first.",
          "error",
        );
        return;
      }

      // ── Select change ────────────────────────────────────────────────

      if (!changeName) {
        if (activeChanges.length === 1) {
          changeName = activeChanges[0];
          ctx.ui.notify(`Auto-selected change: ${changeName}`, "info");
        } else if (ctx.hasUI) {
          const selected = await ctx.ui.select(
            "Select change to review:",
            activeChanges,
          );
          if (selected === undefined) return; // cancelled
          changeName = selected;
        } else {
          ctx.ui.notify(
            `OpenSpec Review: Multiple changes found. Specify one:\n` +
              `  /opsx-review <change-name>\n\n` +
              `Available: ${activeChanges.join(", ")}`,
            "error",
          );
          return;
        }
      }

      if (!changeName || !activeChanges.includes(changeName)) {
        ctx.ui.notify(
          `OpenSpec Review: Change "${changeName}" not found.\n` +
            `Available: ${activeChanges.join(", ")}`,
          "error",
        );
        return;
      }

      // ── Select artifact ──────────────────────────────────────────────

      const availableArtifacts = getAvailableArtifacts(ctx.cwd, changeName!);
      if (availableArtifacts.length === 0) {
        ctx.ui.notify(
          `OpenSpec Review: No artifacts found in openspec/changes/${changeName}/`,
          "error",
        );
        return;
      }

      if (!artifactName) {
        if (availableArtifacts.length === 1) {
          artifactName = availableArtifacts[0];
        } else if (ctx.hasUI) {
          const selected = await ctx.ui.select(
            `Select artifact from "${changeName}":`,
            [...availableArtifacts], // tasks.md first (ARTIFACTS ordering)
          );
          if (selected === undefined) return; // cancelled
          artifactName = selected as Artifact;
        } else {
          // Non-interactive: default to tasks.md if present, else first available
          artifactName = availableArtifacts[0];
        }
      }

      if (!availableArtifacts.includes(artifactName)) {
        ctx.ui.notify(
          `OpenSpec Review: Artifact "${artifactName}" not found in "${changeName}".\n` +
            `Available: ${availableArtifacts.join(", ")}`,
          "error",
        );
        return;
      }

      // ── Open in Plannotator ──────────────────────────────────────────

      const absolutePath = join(
        getOpenSpecChangesDir(ctx.cwd),
        changeName!,
        artifactName!,
      );

      let markdown: string;
      try {
        markdown = readFileSync(absolutePath, "utf-8");
      } catch (err) {
        console.error(
          `[openspec-plannotator] Failed to read ${absolutePath}:`,
          err,
        );
        ctx.ui.notify(
          `OpenSpec Review: Failed to read ${changeName}/${artifactName}`,
          "error",
        );
        return;
      }

      ctx.ui.notify(
        `Opening ${changeName}/${artifactName} in Plannotator...`,
        "info",
      );

      const server = startAnnotateServer({
        markdown,
        filePath: absolutePath,
        origin: "pi",
        htmlContent: planHtmlContent,
      });

      openBrowser(server.url);

      const result = await server.waitForDecision();
      // Brief pause to allow browser to complete its final request
      await new Promise((r) => setTimeout(r, 1500));
      server.stop();

      if (result.feedback && result.feedback.trim()) {
        pi.sendUserMessage(
          `# OpenSpec Review Feedback\n\n` +
            `**File:** \`openspec/changes/${changeName}/${artifactName}\`\n\n` +
            `${result.feedback}\n\n` +
            `Please address the feedback above.`,
        );
      } else {
        ctx.ui.notify("OpenSpec review closed (no feedback).", "info");
      }
    },
  });

  // ── Auto-notification: detect tasks.md writes/edits ───────────────────

  pi.on("tool_call", async (event, _ctx) => {
    if (event.toolName !== "write" && event.toolName !== "edit") return;

    const filePath = (event.input?.path as string) ?? "";
    if (!matchesTasksPattern(filePath)) return;

    const now = Date.now();
    if (now - lastNotifyTime < NOTIFY_COOLDOWN_MS) return;

    // Mark that we should notify the user at turn end
    pendingTasksNotify = true;
  });

  pi.on("turn_end", async (_event, ctx) => {
    if (!pendingTasksNotify) return;
    pendingTasksNotify = false;

    const now = Date.now();
    if (now - lastNotifyTime < NOTIFY_COOLDOWN_MS) return;

    lastNotifyTime = now;
    ctx.ui.notify(
      "OpenSpec tasks.md updated. Use /opsx-review to open it in Plannotator for annotation.",
      "info",
    );
  });
}

#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;

if (!token || !repository) {
  console.error("GITHUB_TOKEN and GITHUB_REPOSITORY are required.");
  process.exit(1);
}

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");
const TARGET_DIRS = ["blog", "projects", "pages"];

function slugify(input) {
  const base = String(input ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "untitled";
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ""));
}

function classify(labels) {
  const lowerLabels = labels.map((l) => l.toLowerCase());
  if (lowerLabels.includes("about")) {
    return "pages";
  }
  if (lowerLabels.includes("projects")) {
    return "projects";
  }
  return "blog";
}

async function cleanSyncedFiles() {
  for (const dir of TARGET_DIRS) {
    const dirPath = path.join(CONTENT_ROOT, dir);
    try {
      const files = await fs.readdir(dirPath);
      for (const file of files) {
        if (!file.endsWith(".md") || file.startsWith("_")) continue;
        const filePath = path.join(dirPath, file);
        const content = await fs.readFile(filePath, "utf8");
        // Only delete if it contains the issueNumber marker
        if (content.includes("issueNumber:")) {
          await fs.unlink(filePath);
        }
      }
    } catch (e) {
      // Directory might not exist yet
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}

async function fetchAllIssues() {
  const [owner, repo] = repository.split("/");
  const all = [];
  let page = 1;
  while (true) {
    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/issues`);
    url.searchParams.set("state", "open");
    url.searchParams.set("per_page", "100");
    url.searchParams.set("page", String(page));
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "astro-issues-sync",
      },
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch issues: ${response.status} ${await response.text()}`,
      );
    }
    const chunk = await response.json();
    if (chunk.length === 0) {
      break;
    }
    all.push(...chunk);
    if (chunk.length < 100) {
      break;
    }
    page += 1;
  }
  return all;
}

async function writeContentFile(kind, slug, issue, labels) {
  const targetPath = path.join(CONTENT_ROOT, kind, `${slug}.md`);
  const frontmatter = [
    "---",
    `title: ${yamlString(issue.title || `Issue ${issue.number}`)}`,
    `date: ${yamlString(issue.created_at)}`,
    `updatedDate: ${yamlString(issue.updated_at)}`,
    `issueNumber: ${issue.number}`,
    `url: ${yamlString(issue.html_url)}`,
    `labels: [${labels.map((label) => yamlString(label)).join(", ")}]`,
    "---",
    "",
  ].join("\n");
  const body = issue.body?.trim() ? `${issue.body.trim()}\n` : "No content.\n";
  await fs.writeFile(targetPath, `${frontmatter}${body}`, "utf8");
}

async function run() {
  // 1. Clean up only the previously synced files
  await cleanSyncedFiles();

  // 2. Fetch only open issues
  const issues = await fetchAllIssues();

  const slugSetByKind = new Map(TARGET_DIRS.map((name) => [name, new Set()]));

  let written = 0;
  for (const issue of issues) {
    // 3. Filter for owner-only issues and skip PRs
    if (issue.pull_request || issue.author_association !== "OWNER") {
      continue;
    }

    // Extract label names properly
    const labels = (issue.labels ?? [])
      .map((label) => (typeof label === "string" ? label : label.name))
      .filter(Boolean);

    const kind = classify(labels);

    let slug =
      kind === "pages"
        ? "about"
        : slugify(issue.title || `issue-${issue.number}`);
    const used = slugSetByKind.get(kind);
    if (used.has(slug)) {
      slug = `${slug}-${issue.number}`;
    }
    used.add(slug);

    console.log(
      `[Sync] Writing ${kind}/${slug} (Labels: ${labels.join(", ") || "none"})`,
    );
    await writeContentFile(kind, slug, issue, labels);
    written += 1;
  }
  console.log(`Synced ${written} issues to Astro content.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

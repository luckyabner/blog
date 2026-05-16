#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
if (!token || !repo) {
  console.error('GITHUB_TOKEN and GITHUB_REPOSITORY must be set');
  process.exit(1);
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeYamlString(s) {
  return String(s).replace(/"/g, '\\"');
}

async function fetchAllIssues() {
  const [owner, repoName] = repo.split('/');
  const url = `https://api.github.com/repos/${owner}/${repoName}/issues?state=all&per_page=100`;
  const res = await fetch(url, { headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'issues-to-content' } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch issues: ${res.status} ${text}`);
  }
  return res.json();
}

async function writeIssueAsContent(issue) {
  if (issue.pull_request) return; // skip PRs
  const labels = (issue.labels || []).map(l => (typeof l === 'string' ? l : l.name)).filter(Boolean);

  const slug = slugify(issue.title || `issue-${issue.number}`);
  const date = issue.created_at || new Date().toISOString();
  const dir = path.join(process.cwd(), 'src', 'content', 'blog');
  const file = path.join(dir, `${slug}.md`);

  const frontmatter = [
    '---',
    `title: "${escapeYamlString(issue.title || '')}"`,
    `slug: "${slug}"`,
    `date: "${date}"`,
    `issueNumber: ${issue.number}`,
    `url: "${issue.html_url}"`,
    `labels: [${labels.map(l => '"' + escapeYamlString(l) + '"').join(', ')}]`,
    '---',
    '',
  ].join('\n');

  const body = issue.body || '';
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(file, frontmatter + body + '\n', 'utf8');
  console.log(`Wrote ${file}`);
}

(async () => {
  try {
    const issues = await fetchAllIssues();
    for (const issue of issues) {
      await writeIssueAsContent(issue);
    }
    console.log('All issues processed');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

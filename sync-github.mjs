#!/usr/bin/env node
/**
 * Replit → GitHub sync via GitHub API
 * Pushes the current working tree to the remote main branch.
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

const TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const OWNER = 'edwardlarry067-oss';
const REPO = 'orbit-future';
const BRANCH = 'main';

if (!TOKEN) {
  console.error('❌ GITHUB_PERSONAL_ACCESS_TOKEN not set');
  process.exit(1);
}

function git(cmd) {
  return execSync(`git --no-optional-locks ${cmd}`, { encoding: 'utf8' }).trim();
}

async function api(method, path, body) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'replit-sync',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return {};
  const json = await res.json();
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ── Get current state ──────────────────────────────────────────────────────────
const localHead = git('rev-parse HEAD');

// Get remote HEAD
const remoteRef = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
const remoteHead = remoteRef.object.sha;

console.log(`Local  HEAD: ${localHead}`);
console.log(`Remote HEAD: ${remoteHead}`);

if (localHead === remoteHead) {
  console.log('✅ Already up to date — nothing to push.');
  process.exit(0);
}

// ── Get the list of ALL files currently tracked (not diff) ─────────────────────
// We always push the entire current working tree to handle diverged history
console.log(`\n📦 Pushing current working tree to ${BRANCH}...`);

// Get all tracked files
const trackedFiles = git('ls-files').split('\n').filter(Boolean);
console.log(`  ${trackedFiles.length} tracked files`);

// Get base tree from current remote commit
const baseCommit = await api('GET', `/repos/${OWNER}/${REPO}/git/commits/${remoteHead}`);
const baseTreeSha = baseCommit.tree.sha;

const treeItems = [];

for (const filePath of trackedFiles) {
  const absPath = `/home/runner/workspace/${filePath}`;
  if (!existsSync(absPath)) {
    console.log(`  ⚠️  Skipping missing file: ${filePath}`);
    continue;
  }

  const isBinary = /\.(jpg|jpeg|png|gif|webp|ico|svg|woff|woff2|ttf|eot|pdf|zip|gz)$/i.test(filePath);
  let content, encoding;

  if (isBinary) {
    content = readFileSync(absPath).toString('base64');
    encoding = 'base64';
  } else {
    content = readFileSync(absPath, 'utf8');
    encoding = 'utf-8';
  }

  const blob = await api('POST', `/repos/${OWNER}/${REPO}/git/blobs`, { content, encoding });
  treeItems.push({ path: filePath, mode: '100644', type: 'blob', sha: blob.sha });
}

console.log(`  📄 ${treeItems.length} files to commit`);

// Create new tree
const newTree = await api('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
  base_tree: baseTreeSha,
  tree: treeItems,
});

// Create commit
const newCommit = await api('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
  message: 'Sync from Replit',
  tree: newTree.sha,
  parents: [remoteHead],
});

console.log(`  ✅ Created commit ${newCommit.sha.slice(0, 8)}`);

// ── Update branch reference ────────────────────────────────────────────────────
await api('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
  sha: newCommit.sha,
  force: true,
});

console.log(`\n✅ Sync complete! ${BRANCH} → ${newCommit.sha.slice(0, 8)}`);

// ── Trigger Vercel deployment ──────────────────────────────────────────────────
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = 'prj_mROB7Kwdo3pOA5wq4erAd2WrTWt1';
const VERCEL_TEAM_ID = 'team_fVmMNk6FmcImRALVo4Jfsf1D';

if (VERCEL_TOKEN) {
  console.log(`\n🚀 Triggering Vercel deployment...`);
  try {
    const vercelRes = await fetch(
      `https://api.vercel.com/v13/deployments?teamId=${VERCEL_TEAM_ID}&projectId=${VERCEL_PROJECT_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'orbitfuture',
          target: 'production',
          gitSource: {
            type: 'github',
            org: OWNER,
            repo: REPO,
            ref: BRANCH,
            sha: newCommit.sha,
          },
        }),
      }
    );
    const vercelData = await vercelRes.json();
    if (vercelData.id) {
      console.log(`✅ Vercel deployment queued: ${vercelData.id}`);
      console.log(`🔗 https://vercel.com/orbit-future/orbitfuture/${vercelData.id}`);
      console.log(`🌐 Will be live at: https://orbitfuture.store`);
    } else if (vercelData.error?.code === 'payment_required') {
      const resetMs = vercelData.error?.limit?.reset;
      const resetTime = resetMs ? new Date(resetMs).toUTCString() : 'midnight UTC';
      console.warn(`⚠️  Vercel daily API deployment limit reached (100/day on Hobby plan).`);
      console.warn(`    Quota resets at: ${resetTime}`);
      console.warn(`    The GitHub push still succeeded — Vercel will deploy automatically`);
      console.warn(`    via its GitHub integration once the quota resets.`);
    } else {
      console.warn(`⚠️  Vercel response:`, JSON.stringify(vercelData));
    }
  } catch (err) {
    console.error(`❌ Vercel trigger failed:`, err.message);
  }
} else {
  console.log(`🌐 VERCEL_TOKEN not set — relying on GitHub webhook to trigger Vercel.`);
}

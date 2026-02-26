#!/usr/bin/env node
/**
 * Blog Publishing Script
 *
 * Creates a new blog post markdown file from CLI arguments,
 * then stages, commits, and pushes to trigger Cloudflare Pages deploy.
 *
 * Usage:
 *   node scripts/publish.mjs --title "Post Title" --description "SEO desc" --categories "AI Voice Agents,AI Strategy" --content content.md
 *   node scripts/publish.mjs --title "Post Title" --description "SEO desc" --categories "AI Automation" --content - < content.md
 *
 * Options:
 *   --title         Post title (required)
 *   --description   Meta description, max 160 chars (required)
 *   --categories    Comma-separated categories (required)
 *   --content       Path to markdown content file, or "-" for stdin (required)
 *   --tags          Comma-separated tags (optional)
 *   --capsule       Answer capsule for GEO, max 200 chars (optional)
 *   --draft         Mark as draft (optional, default false)
 *   --date          Publish date YYYY-MM-DD (optional, defaults to today)
 *   --slug          Custom slug (optional, auto-generated from title)
 *   --author        Author name (optional, defaults to "Fahad Rahman")
 *   --no-push       Skip git push (optional)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, '..', 'src', 'content', 'blog');

const VALID_CATEGORIES = [
  'AI Voice Agents',
  'AI Automation',
  'Industry Playbooks',
  'AI Tools & Reviews',
  'AI Strategy',
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--no-push') {
      args.noPush = true;
      continue;
    }
    if (arg === '--draft') {
      args.draft = true;
      continue;
    }
    if (arg.startsWith('--') && i + 1 < argv.length) {
      const key = arg.slice(2);
      args[key] = argv[++i];
    }
  }
  return args;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function readContent(source) {
  if (source === '-') {
    return readFileSync(0, 'utf-8');
  }
  if (!existsSync(source)) {
    console.error(`Content file not found: ${source}`);
    process.exit(1);
  }
  return readFileSync(source, 'utf-8');
}

function buildFrontmatter(args) {
  const date = args.date || new Date().toISOString().split('T')[0];
  const categories = args.categories.split(',').map((c) => c.trim());

  // Validate categories
  for (const cat of categories) {
    if (!VALID_CATEGORIES.includes(cat)) {
      console.error(`Invalid category: "${cat}"`);
      console.error(`Valid categories: ${VALID_CATEGORIES.join(', ')}`);
      process.exit(1);
    }
  }

  const lines = [
    '---',
    `title: "${args.title.replace(/"/g, '\\"')}"`,
    `description: "${args.description.replace(/"/g, '\\"')}"`,
    `pubDate: ${date}`,
    `author: "${args.author || 'Fahad Rahman'}"`,
    'categories:',
    ...categories.map((c) => `  - "${c}"`),
  ];

  if (args.tags) {
    lines.push('tags:');
    args.tags.split(',').forEach((t) => lines.push(`  - "${t.trim()}"`));
  }

  if (args.draft) {
    lines.push('draft: true');
  }

  if (args.capsule) {
    lines.push(`answerCapsule: "${args.capsule.replace(/"/g, '\\"')}"`);
  }

  lines.push('---');
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);

  // Validate required args
  if (!args.title || !args.description || !args.categories || !args.content) {
    console.error('Missing required arguments.');
    console.error(
      'Usage: node scripts/publish.mjs --title "Title" --description "Desc" --categories "Cat1,Cat2" --content file.md'
    );
    process.exit(1);
  }

  if (args.description.length > 160) {
    console.error(`Description too long (${args.description.length}/160 chars)`);
    process.exit(1);
  }

  if (args.capsule && args.capsule.length > 200) {
    console.error(`Answer capsule too long (${args.capsule.length}/200 chars)`);
    process.exit(1);
  }

  const slug = args.slug || slugify(args.title);
  const filePath = join(BLOG_DIR, `${slug}.md`);

  if (existsSync(filePath)) {
    console.error(`Post already exists: ${filePath}`);
    process.exit(1);
  }

  // Read content
  const content = readContent(args.content);
  const frontmatter = buildFrontmatter(args);
  const fullContent = `${frontmatter}\n\n${content.trim()}\n`;

  // Write file
  writeFileSync(filePath, fullContent, 'utf-8');
  console.log(`Created: ${filePath}`);

  // Git operations
  const rootDir = join(__dirname, '..');
  try {
    execSync(`git add "${filePath}"`, { cwd: rootDir, stdio: 'pipe' });
    execSync(
      `git commit -m "publish: ${args.title}"`,
      { cwd: rootDir, stdio: 'pipe' }
    );
    console.log(`Committed: publish: ${args.title}`);

    if (!args.noPush) {
      execSync('git push', { cwd: rootDir, stdio: 'pipe' });
      console.log('Pushed to remote — Cloudflare Pages will auto-deploy.');
    } else {
      console.log('Skipped push (--no-push flag).');
    }
  } catch (err) {
    console.error('Git operation failed:', err.message);
    console.log('File was created successfully. Run git commands manually.');
  }
}

main();

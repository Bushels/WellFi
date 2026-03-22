import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { Stitch, StitchError, StitchToolClient } from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const DEVICE_TYPES = [
  'DEVICE_TYPE_UNSPECIFIED',
  'MOBILE',
  'DESKTOP',
  'TABLET',
  'AGNOSTIC',
];

const MODEL_IDS = [
  'MODEL_ID_UNSPECIFIED',
  'GEMINI_3_PRO',
  'GEMINI_3_FLASH',
];

function loadEnvFiles() {
  for (const name of ['.env.local', '.env']) {
    const filePath = resolve(projectRoot, name);
    if (!existsSync(filePath)) {
      continue;
    }

    const contents = readFileSync(filePath, 'utf8');
    for (const rawLine of contents.split(/\r?\n/u)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) {
        continue;
      }

      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      if (!key || process.env[key] !== undefined) {
        continue;
      }

      let value = line.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value.replace(/\\n/gu, '\n');
    }
  }
}

function printUsage(exitCode = 0) {
  console.log(`Stitch CLI for WellFi

Usage:
  npm run stitch -- projects [--json]
  npm run stitch -- create --title "WellFi Concepts" [--json]
  npm run stitch -- screens --project <project-id> [--json]
  npm run stitch -- generate --project <project-id> --prompt "A modern heavy oil dashboard" [--device DESKTOP] [--model GEMINI_3_FLASH] [--json]
  npm run stitch -- inspect --project <project-id> --screen <screen-id> [--json]

Notes:
  - Put STITCH_API_KEY in .env.local or export it in your shell.
  - This repo uses static export, so Stitch runs from project scripts today instead of browser code.
`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const withoutPrefix = token.slice(2);
    const equalsIndex = withoutPrefix.indexOf('=');
    if (equalsIndex !== -1) {
      const key = withoutPrefix.slice(0, equalsIndex);
      const value = withoutPrefix.slice(equalsIndex + 1);
      flags[key] = value;
      continue;
    }

    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      flags[withoutPrefix] = next;
      index += 1;
      continue;
    }

    flags[withoutPrefix] = true;
  }

  return {
    command: positional[0],
    flags,
  };
}

function getRequiredFlag(flags, name) {
  const value = flags[name];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required --${name} flag.`);
  }

  return value.trim();
}

function normalizeEnum(value, label, allowedValues) {
  if (!value) {
    return undefined;
  }

  const normalized = String(value).trim().toUpperCase();
  if (!allowedValues.includes(normalized)) {
    throw new Error(
      `Invalid ${label}: ${value}. Allowed values: ${allowedValues.join(', ')}.`
    );
  }

  return normalized;
}

function getClientConfig() {
  loadEnvFiles();

  const config = {};
  if (process.env.STITCH_API_KEY) {
    config.apiKey = process.env.STITCH_API_KEY;
  }
  if (process.env.STITCH_ACCESS_TOKEN) {
    config.accessToken = process.env.STITCH_ACCESS_TOKEN;
  }
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    config.projectId = process.env.GOOGLE_CLOUD_PROJECT;
  }
  if (process.env.STITCH_HOST) {
    config.baseUrl = process.env.STITCH_HOST;
  }

  if (!config.apiKey && !(config.accessToken && config.projectId)) {
    throw new Error(
      'Missing Stitch credentials. Set STITCH_API_KEY or set both STITCH_ACCESS_TOKEN and GOOGLE_CLOUD_PROJECT.'
    );
  }

  return config;
}

async function withSdk(callback) {
  const client = new StitchToolClient(getClientConfig());

  try {
    const sdk = new Stitch(client);
    return await callback(sdk);
  } finally {
    await client.close().catch(() => undefined);
  }
}

function summarizeProject(project) {
  return {
    id: project.id,
    projectId: project.projectId,
    title: project.data?.title ?? project.data?.name ?? null,
    visibility: project.data?.visibility ?? null,
    createTime: project.data?.createTime ?? null,
    updateTime: project.data?.updateTime ?? null,
  };
}

async function summarizeScreen(screen, includeAssets = false) {
  const summary = {
    id: screen.id,
    screenId: screen.screenId,
    projectId: screen.projectId,
    name: screen.data?.name ?? null,
    createTime: screen.data?.createTime ?? null,
    updateTime: screen.data?.updateTime ?? null,
  };

  if (includeAssets) {
    summary.htmlUrl = await screen.getHtml();
    summary.imageUrl = await screen.getImage();
  }

  return summary;
}

function printProjects(projects, asJson) {
  const summaries = projects.map(summarizeProject);
  if (asJson) {
    console.log(JSON.stringify(summaries, null, 2));
    return;
  }

  if (summaries.length === 0) {
    console.log('No Stitch projects found.');
    return;
  }

  console.log(`Found ${summaries.length} Stitch project(s):`);
  for (const project of summaries) {
    const title = project.title ? ` | ${project.title}` : '';
    console.log(`- ${project.projectId}${title}`);
  }
}

function printProject(project, asJson) {
  const summary = summarizeProject(project);
  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`Created Stitch project ${summary.projectId}`);
  if (summary.title) {
    console.log(`Title: ${summary.title}`);
  }
}

function printScreens(screens, asJson) {
  if (asJson) {
    console.log(JSON.stringify(screens, null, 2));
    return;
  }

  if (screens.length === 0) {
    console.log('No screens found for that Stitch project.');
    return;
  }

  console.log(`Found ${screens.length} screen(s):`);
  for (const screen of screens) {
    const name = screen.name ? ` | ${screen.name}` : '';
    console.log(`- ${screen.screenId}${name}`);
  }
}

function printScreen(screen, asJson, verb) {
  if (asJson) {
    console.log(JSON.stringify(screen, null, 2));
    return;
  }

  console.log(`${verb} Stitch screen ${screen.screenId}`);
  console.log(`Project: ${screen.projectId}`);
  if (screen.htmlUrl) {
    console.log(`HTML: ${screen.htmlUrl}`);
  }
  if (screen.imageUrl) {
    console.log(`Image: ${screen.imageUrl}`);
  }
}

async function run() {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (flags.help || flags.h) {
    printUsage(0);
  }

  if (!command) {
    printUsage(1);
  }

  const asJson = Boolean(flags.json);

  switch (command) {
    case 'projects': {
      const projects = await withSdk((sdk) => sdk.projects());
      printProjects(projects, asJson);
      return;
    }

    case 'create': {
      const title = getRequiredFlag(flags, 'title');
      const project = await withSdk((sdk) => sdk.createProject(title));
      printProject(project, asJson);
      return;
    }

    case 'screens': {
      const projectId = getRequiredFlag(flags, 'project');
      const screens = await withSdk(async (sdk) => {
        const project = sdk.project(projectId);
        const list = await project.screens();
        return Promise.all(list.map((screen) => summarizeScreen(screen)));
      });
      printScreens(screens, asJson);
      return;
    }

    case 'generate': {
      const projectId = getRequiredFlag(flags, 'project');
      const prompt = getRequiredFlag(flags, 'prompt');
      const deviceType = normalizeEnum(flags.device, 'device', DEVICE_TYPES);
      const modelId = normalizeEnum(flags.model, 'model', MODEL_IDS);

      const screen = await withSdk(async (sdk) => {
        const project = sdk.project(projectId);
        const generated = await project.generate(prompt, deviceType, modelId);
        return summarizeScreen(generated, true);
      });

      printScreen(screen, asJson, 'Generated');
      return;
    }

    case 'inspect': {
      const projectId = getRequiredFlag(flags, 'project');
      const screenId = getRequiredFlag(flags, 'screen');

      const screen = await withSdk(async (sdk) => {
        const project = sdk.project(projectId);
        const existing = await project.getScreen(screenId);
        return summarizeScreen(existing, true);
      });

      printScreen(screen, asJson, 'Fetched');
      return;
    }

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

run().catch((error) => {
  if (error instanceof StitchError) {
    console.error(`Stitch error [${error.code}]: ${error.message}`);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error while running Stitch CLI.');
  }

  process.exit(1);
});

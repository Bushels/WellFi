'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  FolderKanban,
  LoaderCircle,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

import GlassPanel from '@/components/ui/GlassPanel';
import { spacing } from '@/lib/design-tokens';
import { stitchLab } from '@/lib/content';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
}

interface GoogleTokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

interface StitchProjectSummary {
  id: string;
  title: string;
  updatedAt: string | null;
}

interface StitchScreenSummary {
  screenId: string;
  projectId: string;
  htmlUrl: string;
  imageUrl: string;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const DEFAULT_CLOUD_PROJECT = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT ?? '';
const STITCH_SCOPE = 'https://www.googleapis.com/auth/cloud-platform';
const STORAGE_KEY = 'wellfi-stitch-cloud-project';
const PROJECT_STORAGE_KEY = 'wellfi-stitch-project-id';

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while talking to Stitch.';
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Unknown update time';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export default function StitchSection() {
  const tokenClientRef = useRef<GoogleTokenClient | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [cloudProjectId, setCloudProjectId] = useState(DEFAULT_CLOUD_PROJECT);
  const [projects, setProjects] = useState<StitchProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('WellFi Concepts');
  const [prompt, setPrompt] = useState(stitchLab.promptPlaceholder);
  const [generatedScreen, setGeneratedScreen] = useState<StitchScreenSummary | null>(null);
  const [busyAction, setBusyAction] = useState('');
  const [status, setStatus] = useState('Waiting for Google authentication.');
  const [error, setError] = useState('');

  const canAuthenticate = Boolean(GOOGLE_CLIENT_ID);
  const isAuthenticated = Boolean(authToken);
  const canUseStitch = Boolean(authToken && cloudProjectId.trim());
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? null;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedCloudProject = window.localStorage.getItem(STORAGE_KEY);
    const savedProjectId = window.localStorage.getItem(PROJECT_STORAGE_KEY);

    if (savedCloudProject) {
      setCloudProjectId(savedCloudProject);
    }
    if (savedProjectId) {
      setSelectedProjectId(savedProjectId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (cloudProjectId.trim()) {
      window.localStorage.setItem(STORAGE_KEY, cloudProjectId.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [cloudProjectId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (selectedProjectId) {
      window.localStorage.setItem(PROJECT_STORAGE_KEY, selectedProjectId);
    } else {
      window.localStorage.removeItem(PROJECT_STORAGE_KEY);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.google?.accounts.oauth2) {
      setGoogleReady(true);
      return;
    }

    const interval = window.setInterval(() => {
      if (window.google?.accounts.oauth2) {
        setGoogleReady(true);
        window.clearInterval(interval);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID || !window.google?.accounts.oauth2) {
      return;
    }

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: STITCH_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) {
          setBusyAction('');
          setError(response.error ?? 'Google did not return an access token.');
          setStatus('Authentication failed.');
          return;
        }

        setBusyAction('');
        setAuthToken(response.access_token);
        setError('');
        setStatus('Authenticated with Google. Load your Stitch projects to continue.');
      },
    });
  }, [googleReady]);

  async function runWithStitch<T>(operation: (sdk: import('@google/stitch-sdk').Stitch) => Promise<T>) {
    const projectId = cloudProjectId.trim();
    if (!authToken || !projectId) {
      throw new Error('Authenticate with Google and provide a Google Cloud project ID first.');
    }

    const { Stitch, StitchToolClient } = await import('@google/stitch-sdk');
    const client = new StitchToolClient({
      accessToken: authToken,
      projectId,
    });

    try {
      const sdk = new Stitch(client);
      return await operation(sdk);
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  async function handleConnect() {
    if (!canAuthenticate) {
      setError('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID. Add your browser OAuth client ID to .env.local.');
      return;
    }

    if (!tokenClientRef.current) {
      setError('Google Identity Services has not finished loading yet.');
      return;
    }

    setError('');
    setBusyAction('auth');
    setStatus('Opening Google sign-in...');
    tokenClientRef.current.requestAccessToken({
      prompt: authToken ? '' : 'consent',
    });
  }

  async function handleDisconnect() {
    if (authToken && window.google?.accounts.oauth2.revoke) {
      window.google.accounts.oauth2.revoke(authToken, () => undefined);
    }

    setAuthToken('');
    setProjects([]);
    setSelectedProjectId('');
    setGeneratedScreen(null);
    setBusyAction('');
    setError('');
    setStatus('Google session cleared. Authenticate again to keep using Stitch.');
  }

  async function loadProjects() {
    setBusyAction('projects');
    setError('');
    setStatus('Loading Stitch projects...');

    try {
      const summaries = await runWithStitch(async (sdk) => {
        const list = await sdk.projects();
        return list.map((project) => ({
          id: project.projectId,
          title: project.data?.title ?? project.data?.name ?? project.projectId,
          updatedAt: project.data?.updateTime ?? null,
        }));
      });

      setProjects(summaries);
      if (summaries.length > 0 && !summaries.some((project) => project.id === selectedProjectId)) {
        setSelectedProjectId(summaries[0].id);
      }
      setStatus(`Loaded ${summaries.length} Stitch project${summaries.length === 1 ? '' : 's'}.`);
    } catch (loadError) {
      setError(formatError(loadError));
      setStatus('Could not load Stitch projects.');
    } finally {
      setBusyAction('');
    }
  }

  async function createProject() {
    if (!newProjectTitle.trim()) {
      setError('Enter a title before creating a Stitch project.');
      return;
    }

    setBusyAction('create');
    setError('');
    setStatus('Creating a new Stitch project...');

    try {
      const project = await runWithStitch((sdk) => sdk.createProject(newProjectTitle.trim()));
      const summary = {
        id: project.projectId,
        title: project.data?.title ?? project.data?.name ?? project.projectId,
        updatedAt: project.data?.updateTime ?? null,
      };

      setProjects((current) => [summary, ...current.filter((item) => item.id !== summary.id)]);
      setSelectedProjectId(summary.id);
      setStatus(`Created Stitch project "${summary.title}".`);
    } catch (createError) {
      setError(formatError(createError));
      setStatus('Could not create a Stitch project.');
    } finally {
      setBusyAction('');
    }
  }

  async function generateScreen() {
    const projectId = selectedProjectId || projects[0]?.id;
    if (!projectId) {
      setError('Select or create a Stitch project first.');
      return;
    }
    if (!prompt.trim()) {
      setError('Enter a prompt before generating a Stitch screen.');
      return;
    }

    setBusyAction('generate');
    setError('');
    setStatus('Generating a Stitch screen...');

    try {
      const screen = await runWithStitch(async (sdk) => {
        const project = sdk.project(projectId);
        const generated = await project.generate(prompt.trim(), 'DESKTOP', 'GEMINI_3_FLASH');
        return {
          screenId: generated.screenId,
          projectId,
          htmlUrl: await generated.getHtml(),
          imageUrl: await generated.getImage(),
        };
      });

      setGeneratedScreen(screen);
      setStatus(`Generated screen ${screen.screenId}.`);
    } catch (generateError) {
      setError(formatError(generateError));
      setStatus('Could not generate a Stitch screen.');
    } finally {
      setBusyAction('');
    }
  }

  return (
    <section
      id="stitch"
      className="relative noise-overlay"
      style={{ padding: `${spacing.sectionY} ${spacing.containerX}` }}
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="max-w-3xl">
          <p className="label-text mb-4">{stitchLab.eyebrow}</p>
          <h2 className="display-heading mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
            {stitchLab.title}
          </h2>
          <p className="max-w-2xl text-lg text-text-secondary">
            {stitchLab.description}
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
          <GlassPanel className="p-6 md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-em-cyan">
                  <ShieldCheck size={14} />
                  OAuth
                </div>
                <h3 className="display-heading text-2xl">Google Authentication</h3>
              </div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => void handleDisconnect()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-text-secondary transition hover:border-em-cyan/40 hover:text-text-primary"
                >
                  <LogOut size={16} />
                  Disconnect
                </button>
              ) : null}
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/4 p-4 text-sm text-text-secondary">
                OAuth is Google&apos;s delegated sign-in flow. Translation: you approve access in a popup, and the browser gets a short-lived token instead of a permanent API key.
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Google Cloud Project ID
                </label>
                <input
                  value={cloudProjectId}
                  onChange={(event) => setCloudProjectId(event.target.value)}
                  placeholder="your-google-cloud-project-id"
                  className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-em-cyan/60"
                />
                <p className="text-sm text-text-secondary">{stitchLab.cloudProjectHint}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleConnect()}
                  disabled={!googleReady || !canAuthenticate || busyAction === 'auth'}
                  className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === 'auth' ? <LoaderCircle size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  {isAuthenticated ? 'Refresh Google Token' : 'Connect Google Account'}
                </button>

                <button
                  type="button"
                  onClick={() => void loadProjects()}
                  disabled={!canUseStitch || busyAction === 'projects'}
                  className="btn-secondary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === 'projects' ? <LoaderCircle size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  Load Stitch Projects
                </button>
              </div>

              {!canAuthenticate ? (
                <p className="text-sm text-hw-amber">
                  Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local` before this sign-in flow can work.
                </p>
              ) : null}

              <div className="rounded-2xl border border-em-cyan/15 bg-em-cyan/5 p-4">
                <p className="text-sm text-text-primary">{status}</p>
                {error ? (
                  <p className="mt-2 text-sm text-hw-amber">{error}</p>
                ) : null}
              </div>
            </div>
          </GlassPanel>

          <div className="grid gap-6">
            <GlassPanel className="p-6 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-em-cyan">
                    <FolderKanban size={14} />
                    Projects
                  </div>
                  <h3 className="display-heading text-2xl">Choose a Stitch Workspace</h3>
                  <p className="mt-2 text-sm text-text-secondary">{stitchLab.projectIdHint}</p>
                </div>
              </div>

              <div className="mb-5 flex flex-col gap-3 md:flex-row">
                <input
                  value={newProjectTitle}
                  onChange={(event) => setNewProjectTitle(event.target.value)}
                  placeholder="WellFi Concepts"
                  className="w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-text-primary outline-none transition focus:border-em-cyan/60"
                />
                <button
                  type="button"
                  onClick={() => void createProject()}
                  disabled={!canUseStitch || busyAction === 'create'}
                  className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyAction === 'create' ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  Create Project
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {projects.length > 0 ? (
                  projects.map((project) => {
                    const selected = project.id === selectedProjectId;

                    return (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setSelectedProjectId(project.id)}
                        className={cn(
                          'rounded-2xl border p-4 text-left transition',
                          selected
                            ? 'border-em-cyan/60 bg-em-cyan/8'
                            : 'border-white/10 bg-white/4 hover:border-em-cyan/35 hover:bg-white/6',
                        )}
                      >
                        <div className="text-sm font-medium text-text-primary">{project.title}</div>
                        <div className="mt-1 font-mono text-xs text-text-secondary">{project.id}</div>
                        <div className="mt-3 text-xs text-text-secondary">
                          Updated {formatDate(project.updatedAt)}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 p-5 text-sm text-text-secondary md:col-span-2">
                    Authenticate, enter your Google Cloud project ID, and load projects to populate this workspace list.
                  </div>
                )}
              </div>
            </GlassPanel>

            <GlassPanel glow className="p-6 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-em-cyan">
                    <WandSparkles size={14} />
                    Generate
                  </div>
                  <h3 className="display-heading text-2xl">Prompt Stitch</h3>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-text-secondary">
                  {selectedProject
                    ? `Project ${selectedProject.title}`
                    : 'No project selected'}
                </div>
              </div>

              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  rows={5}
                  placeholder={stitchLab.promptPlaceholder}
                  className="w-full rounded-3xl border border-white/12 bg-black/20 px-4 py-4 text-sm text-text-primary outline-none transition focus:border-em-cyan/60"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void generateScreen()}
                    disabled={!canUseStitch || !selectedProjectId || busyAction === 'generate'}
                    className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyAction === 'generate' ? <LoaderCircle size={18} className="animate-spin" /> : <WandSparkles size={18} />}
                    Generate Desktop Screen
                  </button>

                  {generatedScreen ? (
                    <span className="text-sm text-text-secondary">
                      Latest screen: <span className="font-mono text-text-primary">{generatedScreen.screenId}</span>
                    </span>
                  ) : null}
                </div>

                {generatedScreen ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <a
                      href={generatedScreen.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-2xl border border-white/10 bg-white/4 p-4 transition hover:border-em-cyan/35 hover:bg-white/6"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">Screenshot</span>
                        <ExternalLink size={16} className="text-text-secondary transition group-hover:text-text-primary" />
                      </div>
                      <p className="text-sm text-text-secondary">
                        Open the generated preview image in a new tab.
                      </p>
                    </a>

                    <a
                      href={generatedScreen.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-2xl border border-white/10 bg-white/4 p-4 transition hover:border-em-cyan/35 hover:bg-white/6"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-text-primary">HTML Export</span>
                        <ExternalLink size={16} className="text-text-secondary transition group-hover:text-text-primary" />
                      </div>
                      <p className="text-sm text-text-secondary">
                        Open the HTML artifact returned by Stitch.
                      </p>
                    </a>
                  </div>
                ) : null}
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
}

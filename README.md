This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Stitch SDK

This project now includes [`@google/stitch-sdk`](https://github.com/google-labs-code/stitch-sdk).

This site now supports browser-side Google OAuth for Stitch inside the landing page, and it still includes the server-side CLI for API-key workflows.

Browser auth setup:

1. Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local`.
2. Add `NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT` to `.env.local`.
3. In Google Cloud Console, make sure your OAuth web client allows this site's origin.
4. Open the `Stitch` section on the homepage and authenticate with Google.

Server CLI setup:

1. Add `STITCH_API_KEY` to `.env.local`.
2. List your projects with `npm run stitch:projects`.
3. Create a project with `npm run stitch:create -- --title "WellFi Concepts"`.
4. Generate a screen with `npm run stitch:generate -- --project <project-id> --prompt "A modern heavy oil dashboard" --device DESKTOP`.

Available Stitch commands:

- `npm run stitch:projects`
- `npm run stitch:create -- --title "My Project"`
- `npm run stitch:screens -- --project <project-id>`
- `npm run stitch:generate -- --project <project-id> --prompt "..." --device DESKTOP`
- `npm run stitch:inspect -- --project <project-id> --screen <screen-id>`

Important: [`next.config.ts`](./next.config.ts) still uses `output: "export"`, so any secret-based Stitch integration must stay in scripts or another backend. The in-page Stitch Lab works because it uses Google OAuth in the browser instead of exposing an API key.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

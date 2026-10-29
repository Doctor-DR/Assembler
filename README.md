# Gibson & HiFi DNA Assembly Calculator

A browser-based laboratory utility for planning Gibson Assembly and NEBuilder HiFi DNA assembly reactions. It combines vector/insert molar-ratio calculations, pipetting and dilution guidance, reaction presets, bench protocols, timers, and a local reaction repository in one responsive interface.

**Live app:** https://assembler-ruddy.vercel.app/  
**Source code:** https://github.com/Doctor-DR/Assembler

## Features

- **Reaction calculator** for vector and insert inputs, DNA amounts, molar ratios, and reaction-volume planning.
- **Assembly modes and presets** for common multi-fragment and custom assembly workflows.
- **Pipetting and dilution guidance** to flag very small transfer volumes and suggest working dilutions.
- **Batch calculations and export** for bench planning and experiment records.
- **Bench protocols and timers** for common incubation workflows.
- **Manual and troubleshooting reference** with assembly notes and laboratory reference tables.
- **Reaction Repository** for saving, duplicating, updating, and organizing constructs in the browser.
- **Progressive Web App (PWA)** support, including an installable standalone experience, application icons, and service-worker caching.
- **Responsive interface** for desktop, tablet, and mobile use.

## Try It Online

Open the [live application](https://assembler-ruddy.vercel.app/) in a supported browser.

### Install as an App

This project is a Progressive Web App (PWA), not a separately packaged native executable.

- **Desktop:** Open the app in a supported browser such as Chrome or Edge and use the browser's install control or the app's **Install App** option.
- **Android:** Open the app in Chrome and choose **Install app** or **Add to Home screen** when available.
- **iPhone and iPad:** Open the app in Safari, tap **Share**, and choose **Add to Home Screen**.

Installation options depend on the browser and device. Offline behavior depends on which assets and features have been cached. Verify important workflows before relying on the app without a network connection.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- `vite-plugin-pwa` and Workbox
- Lucide icons

## Run Locally

### Prerequisites

- Node.js with npm, or [Bun](https://bun.sh/)

### Install Dependencies and Start the Development Server

Using Bun:

```bash
bun install
bun run dev
```

Or using npm:

```bash
npm install
npm run dev
```

The Vite development server is configured to use port `3000`. Open the local URL printed in the terminal, usually `http://localhost:3000`.

### Build and Preview

Using Bun:

```bash
bun run build
bun run preview
```

Or using npm:

```bash
npm run build
npm run preview
```

The production build is written to `dist/`.

### Type Check

```bash
bun run lint
```

Or:

```bash
npm run lint
```

The `lint` script runs TypeScript's no-emit check; it is not a full ESLint rule set.

## Deployment

The live application is hosted on Vercel.

1. Import this GitHub repository into Vercel.
2. Set the project root to `./` and use the Vite preset.
3. Use the detected package installation command.
4. Set the build command to `npm run build` and the output directory to `dist` if these are not detected automatically.
5. Deploy and test the resulting URL.

When the connected GitHub branch receives a new commit, Vercel can automatically rebuild and deploy the project.

## Data Storage and Privacy

The Reaction Repository uses the browser's `localStorage` for locally saved constructs. These records are associated with the browser profile and site origin. They are not automatically synchronized between devices or shared between lab members.

Clearing browser site data may remove locally stored records. Export or back up important information, and test data persistence before relying on it for experiment records.

Do not enter confidential, personally identifiable, or otherwise sensitive research data unless you have assessed the suitability of the device and storage environment.

## Scientific Use Disclaimer

This application is a planning and calculation aid. It is not affiliated with or endorsed by New England Biolabs (NEB).

Protocol notes and default parameters are provided for convenience and may not cover every construct, reagent formulation, or experimental condition. Always verify reaction setup, reagent-specific instructions, and experimental decisions against the current manufacturer's documentation and your laboratory's validated procedures.

Users are responsible for checking inputs, units, calculations, and protocol suitability before conducting experiments. The software is provided without a guarantee of experimental outcomes.

## Contributing and Issues

Bug reports, feature requests, and suggestions are welcome through [GitHub Issues](https://github.com/Doctor-DR/Assembler/issues).

Before submitting a change, build the project and test the affected workflows in a browser.

## License

No license has been specified in this repository yet. Unless a license is added, do not assume that the code is available for reuse, redistribution, or modification under an open-source license.

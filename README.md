# Proxmox VM Wizard

A modern, interactive CLI for creating Proxmox VMs with a Vercel-like experience.

## Features

- Interactive step-by-step VM creation
- Arrow-key navigation
- Auto-detection of storage, bridges, and ISOs
- Ceph-safe disk creation
- Clean, modern terminal UI

## Requirements

- Node.js 18+
- Proxmox VE node
- Access to `qm`, `pvesm`, and `pvesh` commands

## Installation

```bash
npm install
```

## Usage

**On a Proxmox VE node:**

```bash
npm start
```

**For testing/development (mock mode):**

```bash
npm run dev:mock
```

Mock mode allows you to test the wizard UI without Proxmox tools installed. It uses fake data for storage pools, bridges, and ISOs.

**Development with auto-reload:**

```bash
npm run dev
```

## Configuration

The wizard stores preferences in `~/.config/pve-cli/config.json`.

Currently supported settings:

| Setting | Description |
|---------|-------------|
| `isoStorage` | Preferred storage for ISO files. Set automatically on first run when you select an ISO storage. |

To reset preferences, delete the config file:

```bash
rm ~/.config/pve-cli/config.json
```

## Build

Compile to JavaScript:

```bash
npm run build
```

## Architecture

Built with:
- **Ink** - React for the terminal
- **TypeScript** - Type safety
- **execa** - Shell command execution

## Project Structure

```
src/
├── index.tsx          # CLI entry point
├── app.tsx            # Main app orchestration
├── steps/             # Step components
│   ├── Welcome.tsx
│   ├── Identity.tsx
│   ├── Compute.tsx
│   ├── Storage.tsx
│   ├── Network.tsx
│   ├── Iso.tsx
│   ├── Summary.tsx
│   ├── Execute.tsx
│   ├── Success.tsx
│   └── Error.tsx
└── lib/               # Utilities
    ├── types.ts       # Type definitions
    ├── validators.ts  # Input validation
    ├── config.ts      # User preferences
    └── proxmox.ts     # Proxmox CLI wrappers
```

## License

MIT

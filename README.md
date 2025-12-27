# pxc - Proxmox VM CLI

A modern, interactive CLI for managing Proxmox VMs with a Vercel-like experience.

## Features

- Interactive step-by-step VM creation wizard
- List, start, and stop VMs and containers across the cluster
- Shows which node each VM/container is running on
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
npm install -g pxc
```

## Usage

```bash
pxc                     # Show help
pxc create              # Create a new VM (interactive wizard)
pxc list                # List all VMs and containers
pxc ls                  # Alias for list
pxc start <vmid>        # Start a VM or container
pxc stop <vmid>         # Stop a VM or container (graceful)
pxc stop <vmid> --force # Force stop a VM

# ISO Management
pxc iso list            # List all ISOs
pxc iso download <url>  # Download ISO from URL
pxc iso upload <file>   # Upload local ISO file
pxc iso delete <name>   # Delete an ISO

# Configuration
pxc config show         # Show current config
pxc config path         # Show config file path
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

Configuration is stored in `~/.config/pxc/config.yaml`:

```yaml
defaults:
  isoStorage: cephfs-iso    # Default storage for ISOs
  vmStorage: local-lvm      # Default storage for VM disks
  bridge: vmbr0             # Default network bridge
  cores: 2                  # Default CPU cores
  memory: 2048              # Default memory (MB)
  disk: 32                  # Default disk size (GB)

ui:
  savePreferences: true     # Auto-save selections as defaults
```

**Commands:**
```bash
pxc config show   # Show current configuration
pxc config path   # Show config file path
```

Preferences are saved automatically when you use ISO commands without specifying a storage. To reset, delete the config file:

```bash
rm ~/.config/pxc/config.yaml
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
├── index.tsx          # CLI entry point with commander
├── app.tsx            # Re-exports for compatibility
├── commands/          # CLI subcommands
│   ├── create.tsx     # VM creation wizard
│   ├── list.tsx       # List VMs
│   ├── start.tsx      # Start VM
│   └── stop.tsx       # Stop VM
├── steps/             # Wizard step components
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

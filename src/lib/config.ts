import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import yaml from 'js-yaml';

const CONFIG_DIR = join(homedir(), '.config', 'pxc');
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml');

// Legacy config path for migration
const LEGACY_CONFIG_FILE = join(homedir(), '.config', 'pve-cli', 'config.json');

/**
 * VM/Container package preset
 */
export interface Package {
	cores?: number;
	memory?: number; // MB
	disk?: number; // GB
	bridge?: string;
	node?: string;
	isoStorage?: string;
	vmStorage?: string;
}

/**
 * Configuration structure
 */
export interface Config {
	defaults?: {
		isoStorage?: string;
		vmStorage?: string;
		bridge?: string;
		cores?: number;
		memory?: number;
		disk?: number;
		node?: string;
		package?: string; // default package to use
	};
	packages?: Record<string, Package>;
	ui?: {
		savePreferences?: boolean;
	};
}

function ensureConfigDir(): void {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}
}

/**
 * Migrate legacy JSON config to new YAML format
 */
function migrateLegacyConfig(): Config | null {
	try {
		if (existsSync(LEGACY_CONFIG_FILE)) {
			const content = readFileSync(LEGACY_CONFIG_FILE, 'utf-8');
			const legacy = JSON.parse(content);

			// Convert legacy format to new format
			const newConfig: Config = {
				defaults: {},
				ui: { savePreferences: true },
			};

			if (legacy.isoStorage) {
				newConfig.defaults!.isoStorage = legacy.isoStorage;
			}

			return newConfig;
		}
	} catch {
		// Ignore migration errors
	}
	return null;
}

/**
 * Load configuration from file
 */
export function loadConfig(): Config {
	try {
		if (existsSync(CONFIG_FILE)) {
			const content = readFileSync(CONFIG_FILE, 'utf-8');
			return (yaml.load(content) as Config) || {};
		}

		// Try to migrate legacy config
		const migrated = migrateLegacyConfig();
		if (migrated) {
			saveConfig(migrated);
			return migrated;
		}
	} catch {
		// Ignore errors, return empty config
	}
	return {};
}

/**
 * Save configuration to file
 */
export function saveConfig(config: Config): void {
	ensureConfigDir();
	const content = yaml.dump(config, {
		indent: 2,
		lineWidth: -1,
		noRefs: true,
	});
	writeFileSync(CONFIG_FILE, content);
}

/**
 * Get a specific default value
 */
export function getDefault<K extends keyof NonNullable<Config['defaults']>>(
	key: K
): NonNullable<Config['defaults']>[K] | undefined {
	const config = loadConfig();
	return config.defaults?.[key];
}

/**
 * Set a specific default value
 */
export function setDefault<K extends keyof NonNullable<Config['defaults']>>(
	key: K,
	value: NonNullable<Config['defaults']>[K]
): void {
	const config = loadConfig();
	if (!config.defaults) {
		config.defaults = {};
	}
	config.defaults[key] = value;
	saveConfig(config);
}

/**
 * Check if preferences should be saved during interaction
 */
export function shouldSavePreferences(): boolean {
	const config = loadConfig();
	return config.ui?.savePreferences !== false;
}

/**
 * Get config file path (for display purposes)
 */
export function getConfigPath(): string {
	return CONFIG_FILE;
}

// Legacy compatibility exports
export function getIsoStoragePreference(): string | undefined {
	return getDefault('isoStorage');
}

export function setIsoStoragePreference(storage: string): void {
	setDefault('isoStorage', storage);
}

/**
 * Get all packages
 */
export function getPackages(): Record<string, Package> {
	const config = loadConfig();
	return config.packages || {};
}

/**
 * Get a specific package
 */
export function getPackage(name: string): Package | undefined {
	const config = loadConfig();
	return config.packages?.[name];
}

/**
 * Set/update a package
 */
export function setPackage(name: string, pkg: Package): void {
	const config = loadConfig();
	if (!config.packages) {
		config.packages = {};
	}
	config.packages[name] = pkg;
	saveConfig(config);
}

/**
 * Delete a package
 */
export function deletePackage(name: string): boolean {
	const config = loadConfig();
	if (config.packages?.[name]) {
		delete config.packages[name];
		saveConfig(config);
		return true;
	}
	return false;
}

/**
 * Get resolved defaults (merges package defaults with simple defaults)
 */
export function getResolvedDefaults(packageName?: string): Partial<Package> {
	const config = loadConfig();
	const defaults = config.defaults || {};

	// Start with simple defaults
	const resolved: Partial<Package> = {
		cores: defaults.cores,
		memory: defaults.memory,
		disk: defaults.disk,
		bridge: defaults.bridge,
		node: defaults.node,
		isoStorage: defaults.isoStorage,
		vmStorage: defaults.vmStorage,
	};

	// Determine which package to use
	const pkgName = packageName || defaults.package;
	if (pkgName && config.packages?.[pkgName]) {
		const pkg = config.packages[pkgName];
		// Package values override defaults
		if (pkg.cores !== undefined) resolved.cores = pkg.cores;
		if (pkg.memory !== undefined) resolved.memory = pkg.memory;
		if (pkg.disk !== undefined) resolved.disk = pkg.disk;
		if (pkg.bridge !== undefined) resolved.bridge = pkg.bridge;
		if (pkg.node !== undefined) resolved.node = pkg.node;
		if (pkg.isoStorage !== undefined) resolved.isoStorage = pkg.isoStorage;
		if (pkg.vmStorage !== undefined) resolved.vmStorage = pkg.vmStorage;
	}

	return resolved;
}

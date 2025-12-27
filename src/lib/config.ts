import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import yaml from 'js-yaml';

const CONFIG_DIR = join(homedir(), '.config', 'pxc');
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml');

// Legacy config path for migration
const LEGACY_CONFIG_FILE = join(homedir(), '.config', 'pve-cli', 'config.json');

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
	};
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

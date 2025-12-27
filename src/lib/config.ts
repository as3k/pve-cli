import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

const CONFIG_DIR = join(homedir(), '.config', 'pve-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface Config {
	isoStorage?: string;
}

function ensureConfigDir(): void {
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}
}

export function loadConfig(): Config {
	try {
		if (existsSync(CONFIG_FILE)) {
			const content = readFileSync(CONFIG_FILE, 'utf-8');
			return JSON.parse(content);
		}
	} catch {
		// Ignore errors, return empty config
	}
	return {};
}

export function saveConfig(config: Config): void {
	ensureConfigDir();
	writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getIsoStoragePreference(): string | undefined {
	return loadConfig().isoStorage;
}

export function setIsoStoragePreference(storage: string): void {
	const config = loadConfig();
	config.isoStorage = storage;
	saveConfig(config);
}

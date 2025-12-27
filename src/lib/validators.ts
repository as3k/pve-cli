/**
 * Validation utilities for VM configuration
 */

export function isValidVmid(vmid: string): boolean {
	const num = parseInt(vmid, 10);
	return !isNaN(num) && num > 0 && num < 999999999;
}

export function isValidVmName(name: string): boolean {
	return name.length > 0 && name.length < 64;
}

export function isValidCores(cores: string): boolean {
	const num = parseInt(cores, 10);
	return !isNaN(num) && num > 0 && num <= 128;
}

export function isValidMemory(memory: string): boolean {
	const num = parseInt(memory, 10);
	return !isNaN(num) && num >= 64 && num <= 1048576; // 64MB to 1TB
}

export function isValidDiskSize(size: string): boolean {
	const num = parseInt(size, 10);
	return !isNaN(num) && num > 0 && num <= 999999; // Up to ~1PB
}

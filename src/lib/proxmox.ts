import { execa } from 'execa';
import type { ProxmoxStorage, ProxmoxBridge, IsoFile, VmState } from './types.js';

/**
 * Check if we're running on a Proxmox node
 */
export async function isProxmoxNode(): Promise<boolean> {
	try {
		await execa('which', ['qm']);
		return true;
	} catch {
		return false;
	}
}

/**
 * Get the next available VM ID
 */
export async function getNextVmid(): Promise<number> {
	try {
		const { stdout } = await execa('pvesh', ['get', '/cluster/nextid']);
		return parseInt(stdout.trim(), 10);
	} catch (error) {
		throw new Error('Failed to get next VM ID. Are you on a Proxmox node?');
	}
}

/**
 * Check if a VM ID is already in use
 */
export async function isVmidAvailable(vmid: number): Promise<boolean> {
	try {
		await execa('qm', ['status', vmid.toString()]);
		return false; // VM exists
	} catch {
		return true; // VM doesn't exist
	}
}

/**
 * Get available storage pools that support VM disks
 */
export async function getStorages(): Promise<ProxmoxStorage[]> {
	try {
		const { stdout } = await execa('pvesm', ['status']);
		const lines = stdout.split('\n').slice(1); // Skip header

		const storages: ProxmoxStorage[] = [];

		for (const line of lines) {
			if (!line.trim()) continue;

			const parts = line.split(/\s+/);
			const [name, type, status, , , content] = parts;

			// Only include storages that can hold VM disks
			if (status === 'active' && content?.includes('images')) {
				storages.push({
					name,
					type,
					available: true,
					content: content.split(','),
				});
			}
		}

		return storages;
	} catch (error) {
		throw new Error('Failed to get storage list');
	}
}

/**
 * Get available network bridges
 */
export async function getBridges(node: string = 'localhost'): Promise<ProxmoxBridge[]> {
	try {
		const { stdout } = await execa('pvesh', ['get', `/nodes/${node}/network`, '--type', 'bridge']);
		const data = JSON.parse(stdout);

		return data.map((bridge: any) => ({
			name: bridge.iface,
			active: bridge.active === 1,
		}));
	} catch (error) {
		// Fallback: parse /etc/network/interfaces or use common defaults
		return [{ name: 'vmbr0', active: true }];
	}
}

/**
 * Get ISO files from a storage
 */
export async function getIsoFiles(storage: string = 'local'): Promise<IsoFile[]> {
	try {
		const { stdout } = await execa('pvesm', ['list', storage]);
		const lines = stdout.split('\n').slice(1); // Skip header

		const isos: IsoFile[] = [];

		for (const line of lines) {
			if (!line.includes('.iso')) continue;

			const parts = line.split(/\s+/);
			const [volid, , size] = parts;
			const filename = volid.split('/').pop() || volid;

			isos.push({
				volid,
				filename,
				size: parseInt(size, 10),
			});
		}

		return isos;
	} catch (error) {
		// Storage might not have ISOs, return empty
		return [];
	}
}

/**
 * Create a VM
 */
export async function createVm(state: VmState): Promise<void> {
	const { vmid, name, cores, memoryMb, diskGb, storage, bridge, isoVolid } = state;

	try {
		// Step 1: Create the VM
		await execa('qm', [
			'create',
			vmid.toString(),
			'--name',
			name,
			'--cores',
			cores.toString(),
			'--memory',
			memoryMb.toString(),
			'--net0',
			`virtio,bridge=${bridge}`,
		]);

		// Step 2: Add disk using slot notation (Ceph-safe)
		await execa('qm', [
			'set',
			vmid.toString(),
			'--scsi0',
			`${storage}:${diskGb}`,
		]);

		// Step 3: Set boot order
		await execa('qm', [
			'set',
			vmid.toString(),
			'--boot',
			'order=scsi0',
		]);

		// Step 4: Attach ISO if provided
		if (isoVolid) {
			await execa('qm', [
				'set',
				vmid.toString(),
				'--ide2',
				`${isoVolid},media=cdrom`,
			]);
		}
	} catch (error: any) {
		throw new Error(`VM creation failed: ${error.message}`);
	}
}

/**
 * Get current node name
 */
export async function getNodeName(): Promise<string> {
	try {
		const { stdout } = await execa('hostname');
		return stdout.trim();
	} catch {
		return 'localhost';
	}
}

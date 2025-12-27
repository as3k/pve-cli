import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { listAllIsos } from '../lib/proxmox.js';
import type { IsoFile } from '../lib/types.js';

function formatBytes(bytes: number): string {
	if (bytes === 0 || isNaN(bytes)) return '-';
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function IsoListCommand() {
	const [isos, setIsos] = useState<IsoFile[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		listAllIsos()
			.then((data) => {
				setIsos(data.sort((a, b) => a.filename.localeCompare(b.filename)));
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return <Text>Loading ISOs...</Text>;
	}

	if (error) {
		return <Text color="red">Error: {error}</Text>;
	}

	if (isos.length === 0) {
		return <Text dimColor>No ISOs found</Text>;
	}

	const nameWidth = Math.max(30, ...isos.map((iso) => iso.filename.length)) + 2;
	const storageWidth = Math.max(10, ...isos.map((iso) => iso.storage.length)) + 2;
	const sizeWidth = 12;

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text bold color="cyan">
				{'NAME'.padEnd(nameWidth)}
				{'STORAGE'.padEnd(storageWidth)}
				{'SIZE'}
			</Text>

			{isos.map((iso) => (
				<Box key={iso.volid}>
					<Text>{iso.filename.padEnd(nameWidth)}</Text>
					<Text dimColor>{iso.storage.padEnd(storageWidth)}</Text>
					<Text>{formatBytes(iso.size)}</Text>
				</Box>
			))}

			<Box marginTop={1}>
				<Text dimColor>
					{isos.length} ISO{isos.length !== 1 ? 's' : ''}
				</Text>
			</Box>
		</Box>
	);
}

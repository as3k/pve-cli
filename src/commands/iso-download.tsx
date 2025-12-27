import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { downloadIso, getIsoStorages } from '../lib/proxmox.js';

interface IsoDownloadCommandProps {
	url: string;
	storage?: string;
	filename?: string;
}

export function IsoDownloadCommand({ url, storage, filename }: IsoDownloadCommandProps) {
	const [status, setStatus] = useState<'checking' | 'downloading' | 'success' | 'error'>('checking');
	const [error, setError] = useState<string>('');
	const [volid, setVolid] = useState<string>('');
	const [targetStorage, setTargetStorage] = useState<string>(storage || '');

	useEffect(() => {
		async function download() {
			try {
				let storageToUse = storage;

				// If no storage specified, find the first ISO-capable storage
				if (!storageToUse) {
					const storages = await getIsoStorages();
					if (storages.length === 0) {
						throw new Error('No ISO-capable storage found');
					}
					storageToUse = storages[0].name;
				}

				setTargetStorage(storageToUse);
				setStatus('downloading');

				const result = await downloadIso(url, storageToUse, filename);
				setVolid(result);
				setStatus('success');
			} catch (err: any) {
				setError(err.message);
				setStatus('error');
			}
		}
		download();
	}, [url, storage, filename]);

	const displayFilename = filename || url.split('/').pop() || 'download.iso';

	if (status === 'checking') {
		return (
			<Box paddingY={1}>
				<Text>Checking storage...</Text>
			</Box>
		);
	}

	if (status === 'downloading') {
		return (
			<Box paddingY={1}>
				<Text color="yellow">Downloading {displayFilename} to {targetStorage}...</Text>
			</Box>
		);
	}

	if (status === 'error') {
		return (
			<Box paddingY={1}>
				<Text color="red">Failed to download ISO: {error}</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text color="green">ISO downloaded successfully</Text>
			<Text dimColor>Volume ID: {volid}</Text>
		</Box>
	);
}

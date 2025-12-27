import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import Spinner from 'ink-spinner';
import { downloadIso, getIsoStorages } from '../lib/proxmox.js';
import { getDefault, setDefault, shouldSavePreferences } from '../lib/config.js';

interface IsoDownloadCommandProps {
	url: string;
	storage?: string;
	filename?: string;
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function ProgressBar({ percent, width = 30 }: { percent: number; width?: number }) {
	const filled = Math.round((percent / 100) * width);
	const empty = width - filled;
	const bar = '█'.repeat(filled) + '░'.repeat(empty);

	return (
		<Text>
			<Text color="green">{bar}</Text>
			<Text> {percent.toString().padStart(3)}%</Text>
		</Text>
	);
}

export function IsoDownloadCommand({ url, storage, filename }: IsoDownloadCommandProps) {
	const [status, setStatus] = useState<'checking' | 'downloading' | 'success' | 'error'>('checking');
	const [error, setError] = useState<string>('');
	const [volid, setVolid] = useState<string>('');
	const [targetStorage, setTargetStorage] = useState<string>(storage || '');
	const [savedPreference, setSavedPreference] = useState<boolean>(false);
	const [progress, setProgress] = useState({
		percent: 0,
		speed: '',
		eta: '',
		downloaded: 0,
		total: 0,
	});

	useEffect(() => {
		async function download() {
			try {
				let storageToUse = storage;

				if (!storageToUse) {
					storageToUse = getDefault('isoStorage');

					if (!storageToUse) {
						const storages = await getIsoStorages();
						if (storages.length === 0) {
							throw new Error('No ISO-capable storage found');
						}
						storageToUse = storages[0].name;

						if (shouldSavePreferences()) {
							setDefault('isoStorage', storageToUse);
							setSavedPreference(true);
						}
					}
				}

				setTargetStorage(storageToUse);
				setStatus('downloading');

				const result = await downloadIso(url, storageToUse, filename, (p) => {
					setProgress(p);
				});

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
				<Text color="yellow">
					<Spinner type="dots" />
				</Text>
				<Text> Checking storage...</Text>
			</Box>
		);
	}

	if (status === 'downloading') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text>
					<Text color="cyan">Downloading:</Text> {displayFilename}
				</Text>
				<Text dimColor>To: {targetStorage}</Text>
				<Box marginTop={1}>
					<ProgressBar percent={progress.percent} />
				</Box>
				<Box>
					<Text dimColor>
						{progress.speed && `${progress.speed}`}
						{progress.eta && ` • ETA: ${progress.eta}`}
						{progress.total > 0 && ` • ${formatBytes(progress.downloaded)} / ${formatBytes(progress.total)}`}
					</Text>
				</Box>
			</Box>
		);
	}

	if (status === 'error') {
		return (
			<Box paddingY={1}>
				<Text color="red">✗ Failed to download ISO: {error}</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text color="green">✓ ISO downloaded successfully</Text>
			<Text dimColor>Volume ID: {volid}</Text>
			{savedPreference && <Text dimColor>Saved {targetStorage} as default ISO storage</Text>}
		</Box>
	);
}

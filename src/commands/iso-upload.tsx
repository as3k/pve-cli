import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { uploadIso, getIsoStorages } from '../lib/proxmox.js';
import { getDefault, setDefault, shouldSavePreferences } from '../lib/config.js';

interface IsoUploadCommandProps {
	file: string;
	storage?: string;
}

export function IsoUploadCommand({ file, storage }: IsoUploadCommandProps) {
	const [status, setStatus] = useState<'checking' | 'uploading' | 'success' | 'error'>('checking');
	const [error, setError] = useState<string>('');
	const [volid, setVolid] = useState<string>('');
	const [targetStorage, setTargetStorage] = useState<string>(storage || '');
	const [savedPreference, setSavedPreference] = useState<boolean>(false);

	useEffect(() => {
		async function upload() {
			try {
				let storageToUse = storage;

				// If no storage specified, check config then find first available
				if (!storageToUse) {
					storageToUse = getDefault('isoStorage');

					if (!storageToUse) {
						const storages = await getIsoStorages();
						if (storages.length === 0) {
							throw new Error('No ISO-capable storage found');
						}
						storageToUse = storages[0].name;

						// Save this as the default for future use
						if (shouldSavePreferences()) {
							setDefault('isoStorage', storageToUse);
							setSavedPreference(true);
						}
					}
				}

				setTargetStorage(storageToUse);
				setStatus('uploading');

				const result = await uploadIso(file, storageToUse);
				setVolid(result);
				setStatus('success');
			} catch (err: any) {
				setError(err.message);
				setStatus('error');
			}
		}
		upload();
	}, [file, storage]);

	const displayFilename = file.split('/').pop() || file;

	if (status === 'checking') {
		return (
			<Box paddingY={1}>
				<Text>Checking storage...</Text>
			</Box>
		);
	}

	if (status === 'uploading') {
		return (
			<Box paddingY={1}>
				<Text color="yellow">Uploading {displayFilename} to {targetStorage}...</Text>
			</Box>
		);
	}

	if (status === 'error') {
		return (
			<Box paddingY={1}>
				<Text color="red">Failed to upload ISO: {error}</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text color="green">ISO uploaded successfully</Text>
			<Text dimColor>Volume ID: {volid}</Text>
			{savedPreference && <Text dimColor>Saved {targetStorage} as default ISO storage</Text>}
		</Box>
	);
}

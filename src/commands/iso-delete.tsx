import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import { deleteIso, listAllIsos } from '../lib/proxmox.js';

interface IsoDeleteCommandProps {
	name: string;
}

export function IsoDeleteCommand({ name }: IsoDeleteCommandProps) {
	const [status, setStatus] = useState<'finding' | 'deleting' | 'success' | 'error' | 'not-found'>('finding');
	const [error, setError] = useState<string>('');
	const [volid, setVolid] = useState<string>('');

	useEffect(() => {
		async function del() {
			try {
				// Find the ISO by name or volid
				const isos = await listAllIsos();
				const iso = isos.find(
					(i) => i.filename === name || i.volid === name || i.filename.toLowerCase() === name.toLowerCase()
				);

				if (!iso) {
					setStatus('not-found');
					return;
				}

				setVolid(iso.volid);
				setStatus('deleting');

				await deleteIso(iso.volid);
				setStatus('success');
			} catch (err: any) {
				setError(err.message);
				setStatus('error');
			}
		}
		del();
	}, [name]);

	if (status === 'finding') {
		return (
			<Box paddingY={1}>
				<Text>Finding ISO...</Text>
			</Box>
		);
	}

	if (status === 'not-found') {
		return (
			<Box paddingY={1}>
				<Text color="red">ISO not found: {name}</Text>
			</Box>
		);
	}

	if (status === 'deleting') {
		return (
			<Box paddingY={1}>
				<Text color="yellow">Deleting {volid}...</Text>
			</Box>
		);
	}

	if (status === 'error') {
		return (
			<Box paddingY={1}>
				<Text color="red">Failed to delete ISO: {error}</Text>
			</Box>
		);
	}

	return (
		<Box paddingY={1}>
			<Text color="green">ISO deleted: {volid}</Text>
		</Box>
	);
}

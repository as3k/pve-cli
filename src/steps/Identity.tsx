import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import { getNextVmid, isVmidAvailable } from '../lib/proxmox.js';
import { isValidVmid, isValidVmName } from '../lib/validators.js';
import type { StepProps } from '../lib/types.js';

export function Identity({ state, onNext }: StepProps) {
	const [defaultVmid, setDefaultVmid] = useState<string>('');
	const [vmid, setVmid] = useState<string>(state.vmid?.toString() || '');
	const [name, setName] = useState<string>(state.name || '');
	const [step, setStep] = useState<'vmid' | 'name'>('vmid');
	const [error, setError] = useState<string>('');

	useEffect(() => {
		getNextVmid()
			.then((id) => {
				const idStr = id.toString();
				setDefaultVmid(idStr);
				if (!vmid) {
					setVmid(idStr);
				}
			})
			.catch(() => {
				setError('Failed to get next VM ID');
			});
	}, []);

	const handleVmidSubmit = async () => {
		if (!isValidVmid(vmid)) {
			setError('Invalid VM ID');
			return;
		}

		const available = await isVmidAvailable(parseInt(vmid, 10));
		if (!available) {
			setError('VM ID already in use');
			return;
		}

		setError('');
		setStep('name');
	};

	const handleNameSubmit = () => {
		if (!isValidVmName(name)) {
			setError('Invalid VM name');
			return;
		}

		onNext({ vmid: parseInt(vmid, 10), name });
	};

	if (step === 'vmid') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text>VM ID {defaultVmid && <Text dimColor>(default: {defaultVmid})</Text>}</Text>
				<TextInput value={vmid} onChange={setVmid} onSubmit={handleVmidSubmit} />
				{error && <Text color="red">{error}</Text>}
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text dimColor>VM ID: {vmid}</Text>
			<Text>VM Name</Text>
			<TextInput value={name} onChange={setName} onSubmit={handleNameSubmit} />
			{error && <Text color="red">{error}</Text>}
		</Box>
	);
}

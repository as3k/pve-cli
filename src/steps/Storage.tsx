import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import { getStorages } from '../lib/proxmox.js';
import type { StepProps } from '../lib/types.js';

export function Storage({ onNext }: StepProps) {
	const [storages, setStorages] = useState<Array<{ label: string; value: string }>>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		getStorages()
			.then((items) => {
				const options = items.map((s) => ({
					label: `${s.name} (${s.type})`,
					value: s.name,
				}));
				setStorages(options);
				setLoading(false);
			})
			.catch((err) => {
				setError('Failed to load storage pools');
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text dimColor>Loading storage pools...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text color="red">{error}</Text>
			</Box>
		);
	}

	if (storages.length === 0) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text color="red">No available storage pools found</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text>Select VM storage</Text>
			<SelectInput items={storages} onSelect={(item) => onNext({ storage: item.value })} />
		</Box>
	);
}

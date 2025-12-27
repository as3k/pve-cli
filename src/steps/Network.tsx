import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import { getBridges, getNodeName } from '../lib/proxmox.js';
import type { StepProps } from '../lib/types.js';

export function Network({ onNext }: StepProps) {
	const [bridges, setBridges] = useState<Array<{ label: string; value: string }>>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		getNodeName()
			.then((node) => getBridges(node))
			.then((items) => {
				const options = items.map((b) => ({
					label: b.name,
					value: b.name,
				}));
				setBridges(options);
				setLoading(false);
			})
			.catch(() => {
				// Fallback to common default
				setBridges([{ label: 'vmbr0', value: 'vmbr0' }]);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text dimColor>Loading network bridges...</Text>
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

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text>Select network bridge</Text>
			<SelectInput items={bridges} onSelect={(item) => onNext({ bridge: item.value })} />
		</Box>
	);
}

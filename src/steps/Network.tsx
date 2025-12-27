import React, { useState, useEffect, useMemo } from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import { getBridges, getNodeName } from '../lib/proxmox.js';
import { getResolvedDefaults } from '../lib/config.js';
import type { StepProps } from '../lib/types.js';

export function Network({ onNext, packageName }: StepProps) {
	const defaults = useMemo(() => getResolvedDefaults(packageName), [packageName]);
	const [bridges, setBridges] = useState<Array<{ label: string; value: string }>>([]);
	const [initialIndex, setInitialIndex] = useState(0);
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
				// Set initial selection to default bridge if specified
				if (defaults.bridge) {
					const idx = options.findIndex((o) => o.value === defaults.bridge);
					if (idx >= 0) setInitialIndex(idx);
				}
				setLoading(false);
			})
			.catch(() => {
				// Fallback to common default
				setBridges([{ label: 'vmbr0', value: 'vmbr0' }]);
				setLoading(false);
			});
	}, [defaults.bridge]);

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
			<Text>Select network bridge{defaults.bridge && <Text dimColor> (default: {defaults.bridge})</Text>}</Text>
			<SelectInput items={bridges} initialIndex={initialIndex} onSelect={(item) => onNext({ bridge: item.value })} />
		</Box>
	);
}

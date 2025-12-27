import React, { useState, useEffect, useMemo } from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import { getStorages } from '../lib/proxmox.js';
import { getResolvedDefaults } from '../lib/config.js';
import type { StepProps } from '../lib/types.js';

export function Storage({ onNext, packageName }: StepProps) {
	const defaults = useMemo(() => getResolvedDefaults(packageName), [packageName]);
	const [storages, setStorages] = useState<Array<{ label: string; value: string }>>([]);
	const [initialIndex, setInitialIndex] = useState(0);
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
				// Set initial selection to default storage if specified
				if (defaults.vmStorage) {
					const idx = options.findIndex((o) => o.value === defaults.vmStorage);
					if (idx >= 0) setInitialIndex(idx);
				}
				setLoading(false);
			})
			.catch((err) => {
				setError('Failed to load storage pools');
				setLoading(false);
			});
	}, [defaults.vmStorage]);

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
			<Text>Select VM storage{defaults.vmStorage && <Text dimColor> (default: {defaults.vmStorage})</Text>}</Text>
			<SelectInput items={storages} initialIndex={initialIndex} onSelect={(item) => onNext({ storage: item.value })} />
		</Box>
	);
}

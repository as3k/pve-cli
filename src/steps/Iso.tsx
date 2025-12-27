import React, { useState, useEffect, useMemo } from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import { getIsoFiles, getIsoStorages } from '../lib/proxmox.js';
import { getIsoStoragePreference, setIsoStoragePreference, getResolvedDefaults } from '../lib/config.js';
import type { StepProps } from '../lib/types.js';

type Phase = 'loading' | 'select-storage' | 'select-iso';

export function Iso({ onNext, packageName }: StepProps) {
	const defaults = useMemo(() => getResolvedDefaults(packageName), [packageName]);
	const [phase, setPhase] = useState<Phase>('loading');
	const [storages, setStorages] = useState<Array<{ label: string; value: string }>>([]);
	const [selectedStorage, setSelectedStorage] = useState<string>('');
	const [isos, setIsos] = useState<Array<{ label: string; value: string }>>([]);

	// Initial load: check for saved preference and available storages
	useEffect(() => {
		async function init() {
			// Check package defaults first, then saved preference
			const savedStorage = defaults.isoStorage || getIsoStoragePreference();
			const availableStorages = await getIsoStorages();

			if (availableStorages.length === 0) {
				// No ISO storages available, skip to ISO selection with empty list
				setIsos([{ label: '(No ISO)', value: '' }]);
				setPhase('select-iso');
				return;
			}

			// Check if saved storage still exists
			const savedExists = savedStorage && availableStorages.some(s => s.name === savedStorage);

			if (savedExists) {
				// Use saved storage directly
				setSelectedStorage(savedStorage);
				loadIsos(savedStorage);
			} else if (availableStorages.length === 1) {
				// Only one storage available, use it directly
				const storage = availableStorages[0].name;
				setSelectedStorage(storage);
				setIsoStoragePreference(storage);
				loadIsos(storage);
			} else {
				// Multiple storages, let user choose
				setStorages(availableStorages.map(s => ({
					label: `${s.name} (${s.type})`,
					value: s.name,
				})));
				setPhase('select-storage');
			}
		}

		init().catch(() => {
			setIsos([{ label: '(No ISO)', value: '' }]);
			setPhase('select-iso');
		});
	}, []);

	function loadIsos(storage: string) {
		getIsoFiles(storage)
			.then((items) => {
				const options = items.map((iso) => ({
					label: iso.filename,
					value: iso.volid,
				}));
				options.unshift({ label: '(No ISO)', value: '' });
				setIsos(options);
				setPhase('select-iso');
			})
			.catch(() => {
				setIsos([{ label: '(No ISO)', value: '' }]);
				setPhase('select-iso');
			});
	}

	function handleStorageSelect(item: { value: string }) {
		setSelectedStorage(item.value);
		setIsoStoragePreference(item.value);
		loadIsos(item.value);
	}

	if (phase === 'loading') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text dimColor>Loading ISO storages...</Text>
			</Box>
		);
	}

	if (phase === 'select-storage') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text>Select storage for ISO files</Text>
				<Text dimColor>(This will be remembered for future use)</Text>
				<SelectInput items={storages} onSelect={handleStorageSelect} />
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text>Select installation ISO (optional)</Text>
			{selectedStorage && <Text dimColor>from {selectedStorage}</Text>}
			<SelectInput items={isos} onSelect={(item) => onNext({ isoVolid: item.value || undefined })} />
		</Box>
	);
}

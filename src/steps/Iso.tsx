import React, { useState, useEffect } from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import { getIsoFiles } from '../lib/proxmox.js';
import type { StepProps } from '../lib/types.js';

export function Iso({ onNext }: StepProps) {
	const [isos, setIsos] = useState<Array<{ label: string; value: string | undefined }>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// TODO: Make this configurable or auto-detect ISO storage
		const isoStorage = 'local';

		getIsoFiles(isoStorage)
			.then((items) => {
				const options = items.map((iso) => ({
					label: iso.filename,
					value: iso.volid,
				}));

				// Always add "No ISO" option
				options.unshift({ label: '(No ISO)', value: undefined });

				setIsos(options);
				setLoading(false);
			})
			.catch(() => {
				// If we can't load ISOs, just offer "No ISO"
				setIsos([{ label: '(No ISO)', value: undefined }]);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text dimColor>Loading ISO files...</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text>Select installation ISO (optional)</Text>
			<SelectInput items={isos} onSelect={(item) => onNext({ isoVolid: item.value })} />
		</Box>
	);
}

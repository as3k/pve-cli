import React, { useEffect, useState } from 'react';
import { Text, Box } from 'ink';
import { createVm } from '../lib/proxmox.js';
import type { VmState } from '../lib/types.js';

interface ExecuteProps {
	state: VmState;
	onSuccess: () => void;
	onError: (error: string) => void;
}

export function Execute({ state, onSuccess, onError }: ExecuteProps) {
	const [status, setStatus] = useState<string>('Creating VM...');

	useEffect(() => {
		createVm(state)
			.then(() => {
				setStatus('VM created successfully');
				setTimeout(onSuccess, 500);
			})
			.catch((err) => {
				onError(err.message);
			});
	}, [state, onSuccess, onError]);

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text>{status}</Text>
		</Box>
	);
}

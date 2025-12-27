import React, { useEffect, useState } from 'react';
import { Text, Box } from 'ink';
import { isProxmoxNode } from '../lib/proxmox.js';

interface WelcomeProps {
	onNext: () => void;
	onError: (error: string) => void;
}

export function Welcome({ onNext, onError }: WelcomeProps) {
	const [checking, setChecking] = useState(true);

	useEffect(() => {
		isProxmoxNode()
			.then((isValid) => {
				if (isValid) {
					setTimeout(onNext, 500); // Brief pause for UX
				} else {
					onError('This tool must be run on a Proxmox VE node');
				}
			})
			.catch(() => {
				onError('Failed to detect Proxmox environment');
			});
	}, [onNext, onError]);

	if (checking) {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text bold>Proxmox VM Wizard</Text>
				<Text dimColor>Checking environment...</Text>
			</Box>
		);
	}

	return null;
}

import React from 'react';
import { Text, Box } from 'ink';
import SelectInput from 'ink-select-input';
import type { StepProps } from '../lib/types.js';

export function Summary({ state, onNext }: StepProps) {
	const items = [
		{ label: 'Create this VM', value: 'confirm' },
		{ label: 'Cancel', value: 'cancel' },
	];

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text bold>VM Configuration Summary</Text>
			<Box paddingY={1} flexDirection="column">
				<Text>
					<Text dimColor>VM ID:       </Text>
					{state.vmid}
				</Text>
				<Text>
					<Text dimColor>Name:        </Text>
					{state.name}
				</Text>
				<Text>
					<Text dimColor>CPU Cores:   </Text>
					{state.cores}
				</Text>
				<Text>
					<Text dimColor>Memory:      </Text>
					{state.memoryMb} MB
				</Text>
				<Text>
					<Text dimColor>Disk:        </Text>
					{state.diskGb} GB on {state.storage}
				</Text>
				<Text>
					<Text dimColor>Network:     </Text>
					{state.bridge}
				</Text>
				<Text>
					<Text dimColor>ISO:         </Text>
					{state.isoVolid || '(none)'}
				</Text>
			</Box>
			<SelectInput
				items={items}
				onSelect={(item) => {
					if (item.value === 'confirm') {
						onNext({});
					} else {
						process.exit(0);
					}
				}}
			/>
		</Box>
	);
}

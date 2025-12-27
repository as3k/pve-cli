import React, { useState } from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';
import { isValidCores, isValidMemory, isValidDiskSize } from '../lib/validators.js';
import type { StepProps } from '../lib/types.js';

export function Compute({ state, onNext }: StepProps) {
	const [cores, setCores] = useState<string>(state.cores?.toString() || '2');
	const [memory, setMemory] = useState<string>(state.memoryMb?.toString() || '2048');
	const [diskSize, setDiskSize] = useState<string>(state.diskGb?.toString() || '20');
	const [step, setStep] = useState<'cores' | 'memory' | 'disk'>('cores');
	const [error, setError] = useState<string>('');

	const handleCoresSubmit = () => {
		if (!isValidCores(cores)) {
			setError('Invalid CPU count');
			return;
		}
		setError('');
		setStep('memory');
	};

	const handleMemorySubmit = () => {
		if (!isValidMemory(memory)) {
			setError('Invalid memory size');
			return;
		}
		setError('');
		setStep('disk');
	};

	const handleDiskSubmit = () => {
		if (!isValidDiskSize(diskSize)) {
			setError('Invalid disk size');
			return;
		}

		onNext({
			cores: parseInt(cores, 10),
			memoryMb: parseInt(memory, 10),
			diskGb: parseInt(diskSize, 10),
		});
	};

	if (step === 'cores') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text>CPU Cores <Text dimColor>(default: 2)</Text></Text>
				<TextInput value={cores} onChange={setCores} onSubmit={handleCoresSubmit} />
				{error && <Text color="red">{error}</Text>}
			</Box>
		);
	}

	if (step === 'memory') {
		return (
			<Box flexDirection="column" paddingY={1}>
				<Text dimColor>CPU Cores: {cores}</Text>
				<Text>Memory (MB) <Text dimColor>(default: 2048)</Text></Text>
				<TextInput value={memory} onChange={setMemory} onSubmit={handleMemorySubmit} />
				{error && <Text color="red">{error}</Text>}
			</Box>
		);
	}

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text dimColor>CPU Cores: {cores}</Text>
			<Text dimColor>Memory: {memory} MB</Text>
			<Text>Disk Size (GB) <Text dimColor>(default: 20)</Text></Text>
			<TextInput value={diskSize} onChange={setDiskSize} onSubmit={handleDiskSubmit} />
			{error && <Text color="red">{error}</Text>}
		</Box>
	);
}

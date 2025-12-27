import React from 'react';
import { Text, Box } from 'ink';
import { loadConfig, getConfigPath } from '../lib/config.js';

export function ConfigShowCommand() {
	const config = loadConfig();
	const configPath = getConfigPath();

	const hasDefaults = config.defaults && Object.keys(config.defaults).length > 0;
	const hasUi = config.ui && Object.keys(config.ui).length > 0;

	return (
		<Box flexDirection="column" paddingY={1}>
			<Text bold color="cyan">Configuration</Text>
			<Text dimColor>{configPath}</Text>
			<Text> </Text>

			{!hasDefaults && !hasUi ? (
				<Text dimColor>No configuration set</Text>
			) : (
				<>
					{hasDefaults && (
						<>
							<Text bold>defaults:</Text>
							{config.defaults?.isoStorage && (
								<Text>  isoStorage: {config.defaults.isoStorage}</Text>
							)}
							{config.defaults?.vmStorage && (
								<Text>  vmStorage: {config.defaults.vmStorage}</Text>
							)}
							{config.defaults?.bridge && (
								<Text>  bridge: {config.defaults.bridge}</Text>
							)}
							{config.defaults?.cores && (
								<Text>  cores: {config.defaults.cores}</Text>
							)}
							{config.defaults?.memory && (
								<Text>  memory: {config.defaults.memory}</Text>
							)}
							{config.defaults?.disk && (
								<Text>  disk: {config.defaults.disk}</Text>
							)}
						</>
					)}

					{hasUi && (
						<>
							<Text bold>ui:</Text>
							{config.ui?.savePreferences !== undefined && (
								<Text>  savePreferences: {String(config.ui.savePreferences)}</Text>
							)}
						</>
					)}
				</>
			)}
		</Box>
	);
}

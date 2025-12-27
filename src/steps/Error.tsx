import React from 'react';
import { Text, Box } from 'ink';

interface ErrorProps {
	error: string;
}

export function Error({ error }: ErrorProps) {
	return (
		<Box flexDirection="column" paddingY={1}>
			<Text color="red" bold>
				✗ Error
			</Text>
			<Text>{error}</Text>
		</Box>
	);
}

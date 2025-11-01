import React from 'react';
import { View, StyleSheet, Modal, Dimensions } from 'react-native';
import { useThemeStore } from '@/store/theme';
import { LockIcon } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface AppOverlayProps {
	visible: boolean;
}

export default function AppOverlay({ visible }: AppOverlayProps) {
	const { theme } = useThemeStore();

	return (
		<Modal
			visible={visible}
			animationType='fade'
			transparent={false}
			statusBarTranslucent
		>
			<View
				style={[
					styles.container,
					{
						backgroundColor: theme.colors.background,
					},
				]}
			>
				<LockIcon
					size={100}
					color={theme.colors.text}
					style={{
						position: 'absolute',
						top: height / 2 - 50,
						left: width / 2 - 50,
					}}
				/>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		height: height,
		width: width,
		zIndex: 9999,
	},
});

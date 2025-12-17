import {
	KeyboardAvoidingView as RNKeyboardAvoidingView,
	KeyboardAvoidingViewProps,
} from 'react-native';

interface props extends KeyboardAvoidingViewProps {
	children: React.ReactNode;
}

const KeyboardAvoidingView = ({ children, ...props }: props) => {
	return <RNKeyboardAvoidingView {...props}>{children}</RNKeyboardAvoidingView>;
};

export default KeyboardAvoidingView;

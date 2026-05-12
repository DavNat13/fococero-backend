// Atoms - Button Component
// Basic button component for the FocoCero Design System

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) => {
  // Placeholder for button implementation
  return {
    type: 'button',
    label,
    variant,
    disabled,
    onPress,
  };
};

export default Button;
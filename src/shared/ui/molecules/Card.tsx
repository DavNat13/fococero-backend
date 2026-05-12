// Molecules - Card Component
// Card component that composes atoms for the FocoCero Design System

import { ButtonProps } from '../atoms/Button';
import { TypographyProps } from '../atoms/Typography';

export interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: ButtonProps;
  onPress?: () => void;
}

export const Card = ({
  title,
  description,
  children,
  action,
  onPress,
}: CardProps) => {
  // Placeholder for card implementation
  return {
    type: 'card',
    title,
    description,
    children,
    action,
    onPress,
  };
};

export default Card;
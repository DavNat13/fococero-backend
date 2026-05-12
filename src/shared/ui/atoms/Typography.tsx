// Atoms - Typography Component
// Text component with variants for the FocoCero Design System

export interface TypographyProps {
  children: string;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
}

export const Typography = ({
  children,
  variant = 'body',
  color,
}: TypographyProps) => {
  // Placeholder for typography implementation
  return {
    type: 'text',
    children,
    variant,
    color,
  };
};

export default Typography;
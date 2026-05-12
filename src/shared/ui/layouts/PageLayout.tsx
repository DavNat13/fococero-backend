// Layouts - PageLayout Component
// Main page container with header, content, and optional footer

export interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const PageLayout = ({
  children,
  title,
  showBackButton = false,
  onBack,
}: PageLayoutProps) => {
  // Placeholder for page layout implementation
  return {
    type: 'page-layout',
    children,
    title,
    showBackButton,
    onBack,
  };
};

export default PageLayout;
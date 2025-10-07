import React, { ReactNode } from 'react';
import HeroHeader from './HeroHeader';
import PageFooter from './PageFooter';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  showHeroButtons?: boolean;
  contentClassName?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  description,
  showHeroButtons = true,
  contentClassName = ""
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroHeader
        title={title}
        subtitle={subtitle}
        description={description}
        showButtons={showHeroButtons}
      />

      <div className={contentClassName || "py-16 bg-white"}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>

      <PageFooter />
    </div>
  );
};

export default PageLayout;

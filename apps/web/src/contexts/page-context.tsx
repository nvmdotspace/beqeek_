import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';

interface PageContextValue {
  pageTitle: string;
  pageIcon?: ReactNode;
  setPageTitle: (title: string) => void;
  setPageIcon: (icon?: ReactNode) => void;
}

const PageContext = createContext<PageContextValue | undefined>(undefined);

export const PageProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState('');
  const [pageIcon, setPageIcon] = useState<ReactNode>();

  // Memoize setters to prevent infinite loops in usePageTitle
  const setPageTitleMemo = useCallback((title: string) => setPageTitle(title), []);
  const setPageIconMemo = useCallback((icon?: ReactNode) => setPageIcon(icon), []);

  return (
    <PageContext.Provider value={{ pageTitle, pageIcon, setPageTitle: setPageTitleMemo, setPageIcon: setPageIconMemo }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within PageProvider');
  }
  return context;
};

/**
 * Hook to set page title and icon
 * Usage in page components:
 * usePageTitle('Workspace Dashboard', <LayoutDashboard className="h-5 w-5" />)
 *
 * Note: Icon is only set on mount to prevent infinite loops from ReactElement recreation
 */
export const usePageTitle = (title: string, icon?: ReactNode) => {
  const { setPageTitle, setPageIcon } = usePageContext();
  const iconRef = useRef<ReactNode>(icon);

  // Store icon in ref to use in cleanup
  iconRef.current = icon;

  // Update title whenever it changes
  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

  // Set icon on mount and cleanup on unmount
  useEffect(() => {
    setPageIcon(iconRef.current);

    return () => {
      setPageTitle('');
      setPageIcon(undefined);
    };
    // setPageTitle and setPageIcon are stable (memoized)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

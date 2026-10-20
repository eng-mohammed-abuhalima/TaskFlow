import { useEffect } from 'react';

/** Sets the browser tab / screen-reader page title: "Dashboard · TaskFlow". Pass null to leave it alone. */
export function usePageTitle(title) {
  useEffect(() => {
    if (title) document.title = `${title} · TaskFlow`;
  }, [title]);
}

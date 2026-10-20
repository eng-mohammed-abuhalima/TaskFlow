import { createContext, useContext } from 'react';
import { DirectionProvider } from '@radix-ui/react-direction';

/*
  Popups (select menus, the date picker) render in a portal. In the app the portal is
  document.body, which already carries data-theme / dir / lang from <html>. When a part of
  the page sets its own theme or direction (docs, previews), wrap it in <ThemeScope> so its
  popups render inside it and inherit the right tokens and direction.
*/
const PortalContext = createContext(undefined);
export const usePortalContainer = () => useContext(PortalContext);

/*
  A modal <dialog> (showModal) sits in the top layer and makes everything outside it inert,
  including popups portalled to document.body. Modal wraps its content in <PortalScope> with the
  dialog itself as the container, so select menus and date pickers inside it stay clickable.
*/
export function PortalScope({ container, children }) {
  return <PortalContext.Provider value={container || undefined}>{children}</PortalContext.Provider>;
}

export function ThemeScope({ container, dir = 'ltr', children }) {
  return (
    <PortalContext.Provider value={container || undefined}>
      <DirectionProvider dir={dir}>{children}</DirectionProvider>
    </PortalContext.Provider>
  );
}

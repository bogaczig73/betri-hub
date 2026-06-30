/**
 * Inline, render-blocking theme bootstrap. Runs before first paint so the
 * canvas never flashes the wrong colour on load. Light is the default; a stored
 * choice in `localStorage.theme` ("light" | "dark") wins if present.
 *
 * Kept as a raw <script> (not a client component) so it executes synchronously
 * in <head> ahead of hydration.
 */
export function ThemeScript() {
  const js = `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

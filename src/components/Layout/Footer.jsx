import { APP_NAME, APP_VERSION } from '../../constants/config.js';

export default function Footer() {
  return (
    <footer className="border-t border-pulse-border py-6 px-8 text-center">
      <p className="font-mono text-xs text-pulse-muted">
        {APP_NAME} v{APP_VERSION} — Your data stays in your browser. Always.
      </p>
    </footer>
  );
}

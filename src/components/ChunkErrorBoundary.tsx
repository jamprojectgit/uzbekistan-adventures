import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

const RELOAD_FLAG = 'jt_chunk_reload';

const isChunkLoadError = (error: unknown) => {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return /Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|ChunkLoadError/i.test(
    message,
  );
};

/**
 * Catches failed lazy-route chunk loads (typical after a new deploy / rollback when the
 * browser still holds a stale index.html) and recovers with a single hard reload instead
 * of leaving a blank page.
 */
class ChunkErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error:', error, info.componentStack);

    if (isChunkLoadError(error)) {
      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1';
        sessionStorage.setItem(RELOAD_FLAG, '1');
      } catch {
        // storage unavailable (private mode) — fall through to the manual fallback
      }
      if (!alreadyReloaded) {
        window.location.reload();
      }
    }
  }

  componentDidMount() {
    try {
      sessionStorage.removeItem(RELOAD_FLAG);
    } catch {
      // ignore
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-muted-foreground text-sm">
            Something went wrong while loading the page.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ChunkErrorBoundary;

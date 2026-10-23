export interface SpotcheckOptions {
  /** Element whose subtree is scanned. Default: document.body. */
  root?: Element;
  /** Toggle shortcut, matched on the physical key. Default: "alt+shift+g". */
  hotkey?: string;
  /** Start open or collapsed, overriding the remembered state. */
  open?: boolean;
  /** Expose the read-only window.__spotcheck hook for tests. Default: true. */
  testHook?: boolean;
}

export type IssueType = 'spacing' | 'grid' | 'type' | 'colour';

export interface SpotcheckIssue {
  no: number;
  type: IssueType;
  text: string;
  short?: string;
  /** Component that wrote the element's JSX. */
  comp: string | null;
  /** Where that JSX is written, e.g. "src/components/list/CustomerTree.tsx:182" (React 18 dev builds). */
  src: string | null;
  el: Element;
}

export interface SpotcheckSystem {
  step: number;
  cols: number;
  gutter: number;
  baseline: number;
}

export interface SpotcheckHandle {
  issues(): SpotcheckIssue[];
  system(): SpotcheckSystem | null;
  rescan(): void;
  /** How many values are marked as deliberate with data-spotcheck-ignore. */
  marked(): number;
  /** The copy-all fix prompt for the open issues. */
  prompt(): string;
  /** Removes the overlay, its listeners and any previewed style. */
  destroy(): void;
}

/** Mounts the overlay once per page; later calls return the live instance. A no-op in production builds and on the server. */
export function init(options?: SpotcheckOptions): SpotcheckHandle;
export function parseHotkey(hotkey: string): (e: KeyboardEvent) => boolean;
/** Mounts on the client and cleans up on unmount. Renders nothing. */
export function Spotcheck(props: SpotcheckOptions): null;

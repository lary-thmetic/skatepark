import { useEffect } from 'react';
import { init, parseHotkey } from './core.js';

export { init, parseHotkey };

/**
 * Drop-in component for apps that prefer JSX: <Spotcheck /> mounts the overlay on the client
 * and removes it on unmount (StrictMode's mount, unmount, mount is handled).
 */
export function Spotcheck(props) {
  useEffect(() => {
    const handle = init(props);
    return () => handle.destroy();
    // options are read once, like init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

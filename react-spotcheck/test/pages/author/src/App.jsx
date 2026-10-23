import { createRoot } from 'react-dom/client';
import { init } from '../../../../dist/index.js';
import { CustomerTree } from './CustomerTree.jsx';
const mark = location.hash === '#mark';
function App() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <CustomerTree mark={mark} />
    </main>
  );
}
createRoot(document.getElementById('root')).render(<App />);
init({ root: document.getElementById('root'), open: true });

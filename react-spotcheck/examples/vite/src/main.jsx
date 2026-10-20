import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Spotcheck } from 'react-spotcheck';

function PriceCard({ name, price, pad = 24 }) {
  return <article style={{ padding: pad, borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb' }}>
    <h3 style={{ margin: 0, fontSize: 18 }}>{name}</h3><p style={{ margin: '8px 0 0', fontSize: 14, color: '#475569' }}>{price}</p></article>;
}
function App() {
  return <main style={{ maxWidth: 960, margin: '0 auto', padding: 32, fontFamily: 'system-ui', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
    <PriceCard name="Starter" price="Free" /><PriceCard name="Pro" price="$12" pad={22} /><PriceCard name="Team" price="$40" />
  </main>;
}
createRoot(document.getElementById('root')).render(<StrictMode><App /><Spotcheck /></StrictMode>);

import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Spotcheck } from '../../dist/index.js';
function Card({ pad }) { return <div className="card" style={{ padding: pad, margin: 8, background: '#fff' }}><h3 style={{ fontSize: 15 }}>Card</h3></div>; }
function App() {
  const [on, setOn] = useState(true);
  window.__toggle = () => setOn(v => !v);
  return <main id="m" style={{ padding: 24 }}><Card pad={23} /><Card pad={24} /><Card pad={24} />{on && <Spotcheck root={document.getElementById("app")} open />}</main>;
}
createRoot(document.getElementById('app')).render(<StrictMode><App /></StrictMode>);

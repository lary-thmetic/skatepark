import { CollapsibleProvider, ChevronRight } from 'fakelib';
const rows = ['Acme', 'Globex', 'Initech'];
export function CustomerTree({ mark }) {
  return (
    <CollapsibleProvider>
      <div className="list-header" data-spotcheck-ignore={mark ? 'gap' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 8 }}>
        <b style={{ height: 32 }}>Customers</b><span style={{ height: 32 }}>Filter</span>
      </div>
      {rows.map(r => (
        <div key={r} className="row" style={{ display: 'flex', gap: 8, padding: 8 }}>
          <ChevronRight className="chev" data-spotcheck-ignore={mark ? 'margin' : undefined} style={{ marginTop: 2 }} />
          <span>{r}</span>
        </div>
      ))}
    </CollapsibleProvider>
  );
}

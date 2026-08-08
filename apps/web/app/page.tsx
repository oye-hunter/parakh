/**
 * Placeholder. The officer console screens (O2 dashboard, O3 queue, O4 case
 * detail, O6 history) go under app/(console)/ — see DESIGN.md.
 */
export default function Home() {
  const endpoints = [
    ['POST', '/api/applications', 'Submit and score an application'],
    ['GET', '/api/cases', 'Officer queue — ?status= ?risk= ?cluster='],
    ['GET', '/api/cases/[id]', 'One case, fully loaded'],
    ['POST', '/api/decisions', 'Approve / reject / escalate'],
    ['GET', '/api/dashboard', 'Stats, distribution, active clusters'],
  ];

  return (
    <main style={{ fontFamily: 'ui-sans-serif, system-ui', padding: '48px 24px', maxWidth: 720, margin: '0 auto' }}>
      <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a8a80' }}>
        Parakh · API
      </p>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 34, margin: '8px 0 4px', fontWeight: 600 }}>
        Every judgment, explained.
      </h1>
      <p style={{ color: '#4a5364', marginTop: 0 }}>
        Backend is running. The officer console is not built yet.
      </p>

      <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: 32, fontSize: 14 }}>
        <tbody>
          {endpoints.map(([method, path, desc]) => (
            <tr key={path} style={{ borderBottom: '1px solid #e4e4d0' }}>
              <td style={{ padding: '10px 12px 10px 0', fontFamily: 'ui-monospace, monospace', color: '#034f46', whiteSpace: 'nowrap' }}>
                {method}
              </td>
              <td style={{ padding: '10px 12px 10px 0', fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>
                {path}
              </td>
              <td style={{ padding: '10px 0', color: '#4a5364' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

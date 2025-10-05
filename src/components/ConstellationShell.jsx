import { useEffect, useState } from 'react';
import ConstellationSearch from './ConstellationSearch.jsx';

export default function ConstellationShell() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen((s) => !s);
    window.addEventListener('toggle-constellation-search', handler);
    return () => window.removeEventListener('toggle-constellation-search', handler);
  }, []);

  return <ConstellationSearch visible={open} onClose={() => setOpen(false)} />;
}

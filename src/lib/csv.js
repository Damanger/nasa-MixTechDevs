export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l && !l.trim().startsWith('#'));
  if (lines.length === 0) return [];

  const split = (line) => {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else { inQuotes = false; }
        } else cur += ch;
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ',') { out.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const headers = split(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = split(lines[i]);
    if (!vals.length) continue;
    const row = {};
    for (let j = 0; j < headers.length; j++) row[headers[j]] = vals[j] ?? '';
    rows.push(row);
  }
  return rows;
}

export default parseCSV;


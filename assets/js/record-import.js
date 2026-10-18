'use strict';

window.ATHLETICS_RECORD_IMPORT = (() => {
  const EVENTS = [
    '100m', '200m', '400m', '800m', '1500m', '5000m',
    '110m H', '400m H', '100m H',
    'Long Jump', 'Triple Jump', 'High Jump', 'Pole Vault',
    'Shot Put', 'Discus', 'Javelin', 'Hammer',
    '4×100m Relay', '4×400m Relay', '4×400m Mixed Relay',
  ];
  const ALIASES = {
    event: ['event', 'eventname', 'race', 'eventdistance'],
    athlete: ['athlete', 'athletes', 'athletename', 'athletenames', 'athletesname', 'name', 'names', 'runner', 'runners', 'relayteam', 'teammembers'],
    performance: ['performance', 'result', 'time', 'mark', 'record', 'timemark', 'resulttime'],
    record_label: ['recordlabel', 'yearmeet', 'yearmeettrial', 'yeartrial', 'yearseason'],
    year: ['year', 'season', 'edition'],
    meet: ['meet', 'competition', 'tournament'],
    college: ['college', 'institute', 'collegeinstitute', 'institution'],
  };
  const REQUIRED = ['event', 'athlete', 'performance'];

  function normalizeHeader(value) {
    return String(value ?? '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function normalizeEvent(value) {
    const eventKey = candidate => normalizeHeader(String(candidate ?? '').replace(/[×*]/g, 'x'));
    const compact = eventKey(value);
    return EVENTS.find(event => eventKey(event) === compact) ?? String(value ?? '').trim();
  }

  function resolveColumns(headers) {
    const normalized = headers.map(normalizeHeader);
    const columns = {};
    for (const [field, aliases] of Object.entries(ALIASES)) {
      const index = normalized.findIndex(header => aliases.includes(header));
      if (index !== -1) columns[field] = index;
    }
    return columns;
  }

  function parseGrid(grid, { strict = false } = {}) {
    const rows = grid.map(row => Array.isArray(row) ? row.map(value => String(value ?? '').trim()) : []);
    const headerLimit = Math.min(rows.length, 15);
    let headerIndex = -1;
    let columns = {};
    for (let index = 0; index < headerLimit; index += 1) {
      const candidate = resolveColumns(rows[index]);
      const hasLabel = candidate.record_label !== undefined || candidate.year !== undefined || candidate.meet !== undefined;
      if (REQUIRED.every(field => candidate[field] !== undefined) && hasLabel) {
        headerIndex = index;
        columns = candidate;
        break;
      }
    }
    if (headerIndex === -1) {
      return {
        records: [],
        error: 'Could not identify a header row with Event, Athlete(s), Performance, and Year or Meet columns. Add clear column headings and try again.',
      };
    }

    const dataRows = rows.slice(headerIndex + 1).filter(row => row.some(value => value !== ''));
    const maxRequiredIndex = Math.max(
      columns.event,
      columns.athlete,
      columns.performance,
      columns.record_label ?? -1,
      columns.year ?? -1,
      columns.meet ?? -1,
    );
    if (strict && dataRows.some(row => row.length !== rows[headerIndex].length || row.length <= maxRequiredIndex)) {
      return {
        records: [],
        error: 'The PDF table columns do not line up consistently. No data was imported. Export the table as CSV or Excel, or correct the PDF table layout and try again.',
      };
    }

    const records = dataRows.map((row, index) => {
      const get = field => columns[field] === undefined ? '' : String(row[columns[field]] ?? '').trim();
      const explicitLabel = get('record_label');
      const year = get('year');
      const meet = get('meet');
      const recordLabel = explicitLabel || [year, meet].filter(Boolean).filter((value, i, values) =>
        i === 0 || normalizeHeader(value) !== normalizeHeader(values[i - 1])).join(' · ');
      return {
        sourceRow: headerIndex + index + 2,
        event: normalizeEvent(get('event')),
        athlete: get('athlete'),
        performance: get('performance'),
        record_label: recordLabel,
        college: get('college'),
      };
    });
    return { records, error: records.length ? '' : 'The file has headings but no data rows to import.' };
  }

  function detectDelimiter(text) {
    const candidates = [',', '\t', ';'];
    let selected = ',';
    let highest = 0;
    for (const delimiter of candidates) {
      let count = 0;
      let quoted = false;
      for (const character of text) {
        if (character === '"') quoted = !quoted;
        else if (!quoted && character === delimiter) count += 1;
      }
      if (count > highest) {
        highest = count;
        selected = delimiter;
      }
    }
    return selected;
  }

  function parseCsv(text) {
    const source = String(text ?? '').replace(/^\uFEFF/, '');
    const delimiter = detectDelimiter(source);
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (character === '"' && quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (!quoted && character === delimiter) {
        row.push(cell);
        cell = '';
      } else if (!quoted && (character === '\n' || character === '\r')) {
        row.push(cell);
        if (row.some(value => value.trim() !== '')) rows.push(row);
        row = [];
        cell = '';
        if (character === '\r' && source[index + 1] === '\n') index += 1;
      } else {
        cell += character;
      }
    }
    if (quoted) return { records: [], error: 'The CSV has an unclosed quoted field. Check the file and try again.' };
    row.push(cell);
    if (row.some(value => value.trim() !== '')) rows.push(row);
    return parseGrid(rows);
  }

  function parsePdfText(text) {
    const lines = String(text ?? '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    const headerIndex = lines.findIndex(line => {
      const cells = line.split(/\t+| {2,}|\s*\|\s*/).map(value => value.trim());
      const columns = resolveColumns(cells);
      return REQUIRED.every(field => columns[field] !== undefined)
        && (columns.record_label !== undefined || columns.year !== undefined || columns.meet !== undefined);
    });
    if (headerIndex === -1) {
      return {
        records: [],
        error: 'This PDF does not contain a clearly readable, aligned records table with recognizable column headings. It may be scanned or use a complex layout. No data was imported; use a text-based table PDF or export it as CSV/Excel.',
      };
    }
    const tableLines = lines.slice(headerIndex).map(line => line
      .split(/\t+| {2,}|\s*\|\s*/)
      .map(value => value.trim()));
    return parseGrid(tableLines, { strict: true });
  }

  function isValidEvent(value) {
    return EVENTS.some(event => normalizeHeader(event.replace(/×/g, 'x')) === normalizeHeader(String(value ?? '').replace(/[×*]/g, 'x')));
  }

  return { EVENTS, normalizeHeader, normalizeEvent, resolveColumns, parseGrid, parseCsv, parsePdfText, isValidEvent };
})();

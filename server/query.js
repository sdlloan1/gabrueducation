function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return String(a) === String(b);
  return JSON.stringify(a) === JSON.stringify(b);
}

function matchOperators(value, cond) {
  return Object.entries(cond).every(([op, arg]) => {
    switch (op) {
      case '$eq':
        return deepEqual(value, arg);
      case '$ne':
        return !deepEqual(value, arg);
      case '$in':
        return (Array.isArray(arg) ? arg : []).some((candidate) => deepEqual(value, candidate));
      case '$nin':
        return !(Array.isArray(arg) ? arg : []).some((candidate) => deepEqual(value, candidate));
      case '$gt':
        return Number(value) > Number(arg);
      case '$gte':
        return Number(value) >= Number(arg);
      case '$lt':
        return Number(value) < Number(arg);
      case '$lte':
        return Number(value) <= Number(arg);
      case '$regex':
        try {
          return new RegExp(String(arg), cond.$options || 'i').test(String(value ?? ''));
        } catch {
          return false;
        }
      case '$options':
        return true;
      case '$exists':
        return arg ? value !== undefined : value === undefined;
      case '$contains':
        return Array.isArray(value) ? value.includes(arg) : String(value ?? '').includes(String(arg));
      default:
        return true;
    }
  });
}

export function matches(record, query) {
  if (!query || typeof query !== 'object' || Array.isArray(query)) return true;
  return Object.entries(query).every(([key, cond]) => {
    if (key === '$and') return (Array.isArray(cond) ? cond : []).every((part) => matches(record, part));
    if (key === '$or') return !cond?.length || cond.some((part) => matches(record, part));
    if (key === '$nor') return !(Array.isArray(cond) ? cond : []).some((part) => matches(record, part));

    const value = record[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) return matchOperators(value, cond);
    if (Array.isArray(value) && !Array.isArray(cond)) return value.some((item) => deepEqual(item, cond));
    return deepEqual(value, cond);
  });
}

export function parseSort(sortBy) {
  const raw = Array.isArray(sortBy) ? sortBy : String(sortBy || '').split(',');
  return raw
    .map((token) => String(token).trim())
    .filter(Boolean)
    .map((token) => (token.startsWith('-') ? { field: token.slice(1), dir: -1 } : { field: token, dir: 1 }));
}

export function sorted(rows, sortBy) {
  const keys = parseSort(sortBy);
  if (!keys.length) return rows;
  return [...rows].sort((a, b) => {
    for (const { field, dir } of keys) {
      const left = a[field];
      const right = b[field];
      if (left === right) continue;
      if (left === undefined || left === null) return 1;
      if (right === undefined || right === null) return -1;
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * dir;
      return String(left).localeCompare(String(right)) * dir;
    }
    return 0;
  });
}

export function applyQuery(rows, query, sortBy, limit, skip) {
  let result = rows.filter((row) => matches(row, query));
  result = sorted(result, sortBy);
  const start = Number(skip) || 0;
  const size = Number(limit) > 0 ? Number(limit) : result.length;
  return { items: result.slice(start, start + size), total: result.length };
}

export function parseJson(value, fallback = {}) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

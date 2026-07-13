// Central LocalStorage utility — every module reads/writes through these
// functions so storage logic never gets duplicated across features.

const PREFIX = 'pai_'

function keyFor(key) {
  return `${PREFIX}${key}`
}

/** Save a value (any JSON-serializable data) under a key */
export function saveData(key, value) {
  try {
    localStorage.setItem(keyFor(key), JSON.stringify(value))
    return true
  } catch (err) {
    console.error('saveData failed:', err)
    return false
  }
}

/** Get a value by key. Returns fallback if missing or on parse error. */
export function getData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(keyFor(key))
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.error('getData failed:', err)
    return fallback
  }
}

/**
 * Update a value at a key. If the stored value is an array, `updater`
 * receives the array and should return the new array. If it's an object,
 * `updater` receives the object and should return the new object.
 */
export function updateData(key, updater, fallback = null) {
  const current = getData(key, fallback)
  const next = typeof updater === 'function' ? updater(current) : updater
  saveData(key, next)
  return next
}

/** Remove a single key */
export function deleteData(key) {
  try {
    localStorage.removeItem(keyFor(key))
    return true
  } catch (err) {
    console.error('deleteData failed:', err)
    return false
  }
}

/** Wipe every key this app owns (used by Settings > Clear all data) */
export function clearData() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k))
    return true
  } catch (err) {
    console.error('clearData failed:', err)
    return false
  }
}

/** Helper: append an item to an array stored at `key`, with an id + timestamps */
export function addItem(key, item) {
  const list = getData(key, [])
  const newItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...item
  }
  saveData(key, [...list, newItem])
  return newItem
}

/** Helper: update one item by id inside an array stored at `key` */
export function updateItem(key, id, changes) {
  const list = getData(key, [])
  const next = list.map((it) =>
    it.id === id ? { ...it, ...changes, updatedAt: new Date().toISOString() } : it
  )
  saveData(key, next)
  return next
}

/** Helper: remove one item by id inside an array stored at `key` */
export function deleteItem(key, id) {
  const list = getData(key, [])
  const next = list.filter((it) => it.id !== id)
  saveData(key, next)
  return next
}

/** Export everything this app owns as a single JSON blob (Settings > Export) */
export function exportAllData() {
  const dump = {}
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => {
      try {
        dump[k.replace(PREFIX, '')] = JSON.parse(localStorage.getItem(k))
      } catch {
        dump[k.replace(PREFIX, '')] = localStorage.getItem(k)
      }
    })
  return dump
}

/** Import a previously exported JSON blob (Settings > Import) */
export function importAllData(dump) {
  try {
    Object.entries(dump).forEach(([key, value]) => saveData(key, value))
    return true
  } catch (err) {
    console.error('importAllData failed:', err)
    return false
  }
}

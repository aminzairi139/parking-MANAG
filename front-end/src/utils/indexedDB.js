const DB_NAME = "ParkingDB";
const DB_VERSION = 1;
const STORE_NAME = "appData";
const MIGRATION_FLAG_KEY = "__parkingStorageMigrated";

const isBrowser = () => typeof window !== "undefined";
const isIndexedDBAvailable = () => isBrowser() && "indexedDB" in window;
const isLocalStorageAvailable = () => isBrowser() && !!window.localStorage;

const fallbackStorage = {
  setItem(key, value) {
    if (!isLocalStorageAvailable()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key) {
    if (!isLocalStorageAvailable()) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  },
  removeItem(key) {
    if (!isLocalStorageAvailable()) return;
    window.localStorage.removeItem(key);
  },
  clear() {
    if (!isLocalStorageAvailable()) return;
    window.localStorage.clear();
  },
};

const openDatabase = () => {
  if (!isIndexedDBAvailable()) {
    console.warn(
      "IndexedDB n'est pas supporté par ce navigateur, utilisation du fallback localStorage.",
    );
    return Promise.reject(new Error("IndexedDB unavailable"));
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const withStore = async (mode, callback) => {
  const db = await openDatabase();

  try {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    const result = await Promise.resolve(callback(store));

    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(transaction.error || new Error("Transaction aborted"));
    });

    return result;
  } finally {
    db.close();
  }
};

export const storage = {
  async setItem(key, value) {
    if (!isIndexedDBAvailable()) {
      fallbackStorage.setItem(key, value);
      return value;
    }

    try {
      return await withStore("readwrite", (store) => {
        store.put(value, key);
        return value;
      });
    } catch (error) {
      console.warn(
        "Erreur IndexedDB setItem, fallback vers localStorage",
        error,
      );
      fallbackStorage.setItem(key, value);
      return value;
    }
  },

  async getItem(key) {
    if (!isIndexedDBAvailable()) {
      return fallbackStorage.getItem(key);
    }

    try {
      const result = await withStore("readonly", (store) => {
        const request = store.get(key);
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
      return result ?? null;
    } catch (error) {
      console.warn(
        "Erreur IndexedDB getItem, fallback vers localStorage",
        error,
      );
      return fallbackStorage.getItem(key);
    }
  },

  async removeItem(key) {
    if (!isIndexedDBAvailable()) {
      fallbackStorage.removeItem(key);
      return;
    }

    try {
      await withStore("readwrite", (store) => {
        store.delete(key);
      });
    } catch (error) {
      console.warn(
        "Erreur IndexedDB removeItem, fallback vers localStorage",
        error,
      );
      fallbackStorage.removeItem(key);
    }
  },

  async clear() {
    if (!isIndexedDBAvailable()) {
      fallbackStorage.clear();
      return;
    }

    try {
      await withStore("readwrite", (store) => {
        store.clear();
      });
    } catch (error) {
      console.warn("Erreur IndexedDB clear, fallback vers localStorage", error);
      fallbackStorage.clear();
    }
  },
};

export async function migrateLegacyStorage() {
  if (!isBrowser()) return false;
  if (window.localStorage.getItem(MIGRATION_FLAG_KEY) === "true") {
    return false;
  }

  const legacyKeys = ["parkingAuthUser", "parkingAdminAgents"];
  let migrated = false;

  for (const key of legacyKeys) {
    const rawValue = window.localStorage.getItem(key);
    if (rawValue === null) continue;

    try {
      const parsedValue = JSON.parse(rawValue);
      await storage.setItem(key, parsedValue);
    } catch {
      await storage.setItem(key, rawValue);
    }

    window.localStorage.removeItem(key);
    migrated = true;
  }

  if (migrated) {
    window.localStorage.setItem(MIGRATION_FLAG_KEY, "true");
  }

  return migrated;
}

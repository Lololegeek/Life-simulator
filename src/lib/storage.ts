import { del, get, set } from 'idb-keyval';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import type { StateStorage } from 'zustand/middleware';

/** Zustand storage backed by IndexedDB, with lz-string compression (lives get long!). */
export const compressedIdbStorage: StateStorage = {
  getItem: async (name) => {
    const raw = await get<string>(name);
    if (!raw) return null;
    return decompressFromUTF16(raw) ?? null;
  },
  setItem: async (name, value) => {
    await set(name, compressToUTF16(value));
  },
  removeItem: async (name) => {
    await del(name);
  },
};

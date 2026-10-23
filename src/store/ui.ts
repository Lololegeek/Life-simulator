'use client';

import { create } from 'zustand';

export type TabId = 'life' | 'career' | 'relations' | 'activities' | 'assets';
export const TAB_ORDER: TabId[] = ['life', 'career', 'relations', 'activities', 'assets'];

interface UiState {
  tab: TabId;
  paletteOpen: boolean;
  settingsOpen: boolean;
  personId: string | null;
  setTab: (t: TabId) => void;
  setPalette: (o: boolean) => void;
  setSettings: (o: boolean) => void;
  openPerson: (id: string | null) => void;
}

export const useUi = create<UiState>((set) => ({
  tab: 'life',
  paletteOpen: false,
  settingsOpen: false,
  personId: null,
  setTab: (tab) => set({ tab }),
  setPalette: (paletteOpen) => set({ paletteOpen }),
  setSettings: (settingsOpen) => set({ settingsOpen }),
  openPerson: (personId) => set({ personId }),
}));

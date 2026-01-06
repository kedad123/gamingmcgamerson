import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "animal-mixer-saved-splits";

type SavedSplits = Record<string, number>;

export const useSavedSplits = () => {
  const [savedSplits, setSavedSplits] = useState<SavedSplits>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSplits));
    } catch {
      // Ignore storage errors
    }
  }, [savedSplits]);

  const getSavedSplit = useCallback(
    (animal: string): number | undefined => {
      return savedSplits[animal.toLowerCase()];
    },
    [savedSplits]
  );

  const saveSplit = useCallback((animal: string, splitPosition: number) => {
    setSavedSplits((prev) => ({
      ...prev,
      [animal.toLowerCase()]: splitPosition,
    }));
  }, []);

  const hasSavedSplit = useCallback(
    (animal: string): boolean => {
      return animal.toLowerCase() in savedSplits;
    },
    [savedSplits]
  );

  return { getSavedSplit, saveSplit, hasSavedSplit };
};

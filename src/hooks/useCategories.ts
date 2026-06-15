"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Category } from "@/types";

// Default categories used before DB data loads (prevents empty flash)
const FALLBACK: Category[] = [
  { id: "1", name: "Music",        emoji: "🎵", created_at: "" },
  { id: "2", name: "Sports",       emoji: "⚽", created_at: "" },
  { id: "3", name: "Arts",         emoji: "🎨", created_at: "" },
  { id: "4", name: "Food & Drink", emoji: "🍽️", created_at: "" },
  { id: "5", name: "Business",     emoji: "💼", created_at: "" },
  { id: "6", name: "Technology",   emoji: "💻", created_at: "" },
  { id: "7", name: "Comedy",       emoji: "😂", created_at: "" },
  { id: "8", name: "Fashion",      emoji: "👗", created_at: "" },
  { id: "9", name: "Other",        emoji: "🎉", created_at: "" },
];

let _cached: Category[] | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(
    _cached ?? FALLBACK,
  );
  const [loading, setLoading] = useState(_cached === null);

  useEffect(() => {
    if (_cached) {
      setCategories(_cached);
      setLoading(false);
      return;
    }

    let mounted = true;
    const supabase = createClient();

    supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (!mounted || !data?.length) return;
        _cached = data as Category[];
        setCategories(_cached);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { categories, loading };
}

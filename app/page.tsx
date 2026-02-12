"use client";

import { useEffect, useState, useCallback } from "react";
import { getImageForDays } from "@/lib/images";
import styles from "./page.module.css";

export default function Home() {
  const [days, setDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDays = useCallback(async () => {
    try {
      const res = await fetch("/api/incident");
      const data = await res.json();
      setDays(data.days);
    } catch {
      setDays(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDays();
  }, [fetchDays]);

  const handleReset = async () => {
    try {
      const res = await fetch("/api/incident", { method: "POST" });
      const data = await res.json();
      setDays(data.days);
    } catch {
      setDays(0);
    }
  };

  const currentDays = days ?? 0;
  const image = getImageForDays(currentDays);

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Wipeout Tracker</h1>

      <img
        className={styles.image}
        src={image.src}
        alt={image.alt}
        width={320}
        height={320}
      />

      <p className={styles.counter}>
        {loading ? "..." : currentDays}
      </p>
      <p className={styles.label}>
        {currentDays === 1 ? "Day" : "Days"} Since Last Wipeout
      </p>

      <button className={styles.resetButton} onClick={handleReset}>
        I Wiped Out!
      </button>
    </main>
  );
}

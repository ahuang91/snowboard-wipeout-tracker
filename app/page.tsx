"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getImageForDays } from "@/lib/images";
import styles from "./page.module.css";

function generateChoices(): number[] {
  const SECRET = 13;
  const others = new Set<number>();
  while (others.size < 3) {
    const n = Math.floor(Math.random() * 90) + 10; // 10–99
    if (n !== SECRET) others.add(n);
  }
  const all = [SECRET, ...others];
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}

export default function Home() {
  const [days, setDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [choices, setChoices] = useState<number[]>([]);
  const [wrongChoice, setWrongChoice] = useState<number | null>(null);

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

  const openDialog = () => {
    setWrongChoice(null);
    setChoices(generateChoices());
    setShowDialog(true);
  };

  const handleChoice = async (n: number) => {
    if (n !== 13) {
      setWrongChoice(n);
      setTimeout(() => setShowDialog(false), 800);
      return;
    }
    setShowDialog(false);
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

      <button className={styles.resetButton} onClick={openDialog}>
        I Wiped Out!
      </button>

      {showDialog && (
        <div className={styles.overlay} onClick={() => setShowDialog(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.dialogPrompt}>Prove it — pick the magic number:</p>
            <div className={styles.choiceGrid}>
              {choices.map((n) => (
                <button
                  key={n}
                  className={`${styles.choiceButton} ${wrongChoice === n ? styles.choiceWrong : ""}`}
                  onClick={() => handleChoice(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

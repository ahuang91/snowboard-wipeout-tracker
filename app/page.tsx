"use client";

import { useEffect, useState, useCallback } from "react";
import { getImageForDays } from "@/lib/images";
import type { WipeoutEntry, RunDifficulty } from "@/lib/types";
import styles from "./page.module.css";

const DIFFICULTY_LABELS: Record<RunDifficulty, string> = {
  green: "Green Circle",
  blue: "Blue Square",
  black: "Black Diamond",
  doubleBlack: "Double Black Diamond",
  terrainPark: "Terrain Park",
};

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

  // Wipeout log state
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [formDetails, setFormDetails] = useState("");
  const [formResort, setFormResort] = useState("");
  const [formRun, setFormRun] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<RunDifficulty | "">("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [latestEntry, setLatestEntry] = useState<WipeoutEntry | null>(null);
  const [log, setLog] = useState<WipeoutEntry[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const fetchDays = useCallback(async () => {
    try {
      const res = await fetch("/api/incident");
      const data = await res.json();
      setDays(data.days);
      setLatestEntry(data.latestEntry ?? null);
      setLog(data.log ?? []);
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

  const handleChoice = (n: number) => {
    if (n !== 13) {
      setWrongChoice(n);
      setTimeout(() => setShowDialog(false), 800);
      return;
    }
    setShowDialog(false);
    setShowDetailsForm(true);
  };

  const handleDetailsCancel = () => {
    setShowDetailsForm(false);
    setFormDetails("");
    setFormResort("");
    setFormRun("");
    setFormDifficulty("");
  };

  const handleDetailsSubmit = async () => {
    if (!formDetails.trim() || formSubmitting) return;

    setFormSubmitting(true);
    try {
      const res = await fetch("/api/incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          details: formDetails,
          ...(formResort.trim() ? { resort: formResort } : {}),
          ...(formRun.trim() ? { run: formRun } : {}),
          ...(formDifficulty ? { runDifficulty: formDifficulty } : {}),
        }),
      });
      const data = await res.json();
      setDays(data.days);
      setLatestEntry(data.latestEntry);
      if (data.latestEntry) {
        setLog((prev) => [data.latestEntry, ...prev]);
      }
      handleDetailsCancel();
    } catch {
      setDays(0);
    } finally {
      setFormSubmitting(false);
    }
  };

  const currentDays = days ?? 0;
  const image = getImageForDays(currentDays);

  return (
    <main className={styles.container}>
      <button className={styles.logToggle} onClick={() => setShowSidebar(true)}>
        Wipeout Log
      </button>

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

      {latestEntry && (
        <div className={styles.latestEntry}>
          <p className={styles.latestLabel}>Latest Wipeout</p>
          <p className={styles.latestDetails}>{latestEntry.details}</p>
          <p className={styles.latestMeta}>
            {[
              latestEntry.resort,
              latestEntry.run,
              latestEntry.runDifficulty
                ? DIFFICULTY_LABELS[latestEntry.runDifficulty]
                : null,
            ]
              .filter(Boolean)
              .join(" \u2022 ") || new Date(latestEntry.timestamp).toLocaleDateString()}
          </p>
        </div>
      )}

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

      {showDetailsForm && (
        <div className={styles.overlay} onClick={handleDetailsCancel}>
          <div className={styles.detailsDialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.dialogPrompt}>Log Your Wipeout</p>

            <label className={styles.fieldLabel}>
              Details <span className={styles.required}>*</span>
            </label>
            <textarea
              className={styles.textarea}
              value={formDetails}
              onChange={(e) => setFormDetails(e.target.value)}
              placeholder="What happened?"
              rows={3}
            />

            <label className={styles.fieldLabel}>Resort</label>
            <input
              className={styles.input}
              value={formResort}
              onChange={(e) => setFormResort(e.target.value)}
              placeholder="e.g. Whistler Blackcomb"
            />

            <label className={styles.fieldLabel}>Run</label>
            <input
              className={styles.input}
              value={formRun}
              onChange={(e) => setFormRun(e.target.value)}
              placeholder="e.g. Peak to Creek"
            />

            <label className={styles.fieldLabel}>Run Difficulty</label>
            <select
              className={styles.select}
              value={formDifficulty}
              onChange={(e) => setFormDifficulty(e.target.value as RunDifficulty | "")}
            >
              <option value="">— Select —</option>
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <div className={styles.formButtons}>
              <button
                className={styles.cancelButton}
                onClick={handleDetailsCancel}
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button
                className={styles.submitButton}
                onClick={handleDetailsSubmit}
                disabled={!formDetails.trim() || formSubmitting}
              >
                {formSubmitting ? "Logging..." : "Log Wipeout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSidebar && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setShowSidebar(false)}
        >
          <div className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Wipeout Log</h2>
              <button
                className={styles.sidebarClose}
                onClick={() => setShowSidebar(false)}
              >
                &times;
              </button>
            </div>
            <div className={styles.sidebarContent}>
              {log.length === 0 ? (
                <p className={styles.emptyLog}>No wipeouts logged yet.</p>
              ) : (
                log.map((entry) => (
                  <div key={entry.id} className={styles.logEntry}>
                    <p className={styles.logDate}>
                      {new Date(entry.timestamp).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className={styles.logDetails}>{entry.details}</p>
                    {(entry.resort || entry.run || entry.runDifficulty) && (
                      <p className={styles.logMeta}>
                        {[
                          entry.resort,
                          entry.run,
                          entry.runDifficulty
                            ? DIFFICULTY_LABELS[entry.runDifficulty]
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" \u2022 ")}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

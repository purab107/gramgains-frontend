'use client';

import { useState, useEffect } from 'react';
import { ApiService, DailySummary, MealLogItem } from '../services/api';
import { MacroCard } from '../components/MacroCard';
import { DailyTimeline } from '../components/DailyTimeline';
import { MealLoggerModal } from '../components/MealLoggerModal';
import { Plus, Flame, Activity, Sparkles, Layers } from 'lucide-react';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState<DailySummary>({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
  });
  const [logs, setLogs] = useState<MealLogItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Default target goals for Phase 1
  const targets = {
    calories: 2200,
    protein: 140,
    carbohydrates: 250,
    fat: 65,
    fiber: 30,
  };

  useEffect(() => {
    loadDailyTracker();
  }, [selectedDate]);

  const loadDailyTracker = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getDailyLogs(selectedDate);
      setSummary(data.summary);
      setLogs(data.logs);
    } catch (err) {
      console.error('Failed to load daily tracker', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      {/* Header section */}
      <header className="header">
        <div className="title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Flame color="#10B981" size={28} />
            <h1>GramGains</h1>
          </div>
          <p>Phase 1 • Layered IFCT 2017 & INDB Calorie Tracker</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={18} /> Log Meal
          </button>
        </div>
      </header>

      {/* Datasets Layer Info banner */}
      <div
        className="glass-panel"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(59, 130, 246, 0.06)',
          borderColor: 'rgba(59, 130, 246, 0.2)',
        }}
      >
        <Layers color="#3B82F6" size={24} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#93C5FD' }}>
            2-Layer Combined Database Architecture Active
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Layer 1 (IFCT 2017)</strong> provides exact basic raw ingredient densities. <strong>Layer 2 (INDB)</strong> handles cooked Indian recipes accounting for water absorption & oil prep.
          </div>
        </div>
      </div>

      {/* Macro Summary Dashboard */}
      <section className="grid-macros">
        <MacroCard
          label="Calories"
          value={summary.calories}
          unit="kcal"
          target={targets.calories}
          color="var(--accent-orange)"
        />
        <MacroCard
          label="Protein"
          value={summary.protein}
          unit="g"
          target={targets.protein}
          color="var(--accent-green)"
        />
        <MacroCard
          label="Carbohydrates"
          value={summary.carbohydrates}
          unit="g"
          target={targets.carbohydrates}
          color="var(--accent-blue)"
        />
        <MacroCard
          label="Fats"
          value={summary.fat}
          unit="g"
          target={targets.fat}
          color="var(--accent-purple)"
        />
        <MacroCard
          label="Fiber"
          value={summary.fiber}
          unit="g"
          target={targets.fiber}
          color="#34D399"
        />
      </section>

      {/* Daily Timeline */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Daily Timeline</h2>
          {loading && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Refreshing...</span>}
        </div>
        <DailyTimeline logs={logs} onLogDeleted={loadDailyTracker} />
      </section>

      {/* Log Modal */}
      <MealLoggerModal
        date={selectedDate}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogged={loadDailyTracker}
      />
    </main>
  );
}

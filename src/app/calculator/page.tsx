'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, UserProfile } from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { 
  Calculator, 
  Flame, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Ruler, 
  Weight, 
  Activity,
  Save
} from 'lucide-react';

export default function CalculatorPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [age, setAge] = useState(25);
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);
  const [activityLevel, setActivityLevel] = useState<
    'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'VERY_ACTIVE' | 'EXTRA_ACTIVE'
  >('MODERATE');
  const [goal, setGoal] = useState<'WEIGHT_LOSS' | 'MAINTAIN' | 'BULK'>('MAINTAIN');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const prof = await ApiService.getProfile();
      setUserProfile(prof);
      if (prof) {
        setName(prof.name);
        setGender(prof.gender);
        setAge(prof.age);
        setHeightCm(prof.heightCm);
        setWeightKg(prof.weightKg);
        setActivityLevel(prof.activityLevel);
        setGoal(prof.goal);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time formula calculation
  const calculateMetabolics = () => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += gender === 'MALE' ? 5 : -161;

    const activityMultipliers = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    let targetCalories = tdee;
    if (goal === 'WEIGHT_LOSS') targetCalories = Math.max(1200, tdee - 500);
    if (goal === 'BULK') targetCalories = tdee + 350;

    // Macro Ratios: Protein 2g/kg, Fat 25% of calories, Rest Carbs
    const targetProtein = Math.round(weightKg * 2.0);
    const fatCalories = targetCalories * 0.25;
    const targetFat = Math.round(fatCalories / 9);
    const carbCalories = targetCalories - (targetProtein * 4 + fatCalories);
    const targetCarbs = Math.max(50, Math.round(carbCalories / 4));
    const targetFiber = 30;

    return {
      bmr: Math.round(bmr),
      tdee,
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFat,
      targetFiber,
    };
  };

  const metabolics = calculateMetabolics();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload: Partial<UserProfile> = {
        name: name.trim() || 'Athlete',
        gender,
        age: Number(age),
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        activityLevel,
        goal,
        bmr: metabolics.bmr,
        tdee: metabolics.tdee,
        targetCalories: metabolics.targetCalories,
        targetProtein: metabolics.targetProtein,
        targetCarbs: metabolics.targetCarbs,
        targetFat: metabolics.targetFat,
        targetFiber: metabolics.targetFiber,
      };

      const updated = await ApiService.updateProfile(payload);
      setUserProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-white">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl bg-slate-900/80 border border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4" />
                <span>Metabolic Science Calculator</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                TDEE & Target Macro Calculator
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Calculate your Basal Metabolic Rate (BMR), Maintenance TDEE, and target protein/carbs/fat ratios.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Sync Targets'}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Profile updated! Your new TDEE and daily macro goals are now synced with your dashboard.</span>
            </div>
          )}

          {/* Grid Layout: Inputs Left, Live Results Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-7 glass-panel p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Personal & Body Metrics</span>
              </h2>

              <form onSubmit={handleSave} className="space-y-5">
                {/* Name & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Athlete Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Purab"
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('MALE')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          gender === 'MALE'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-white/10 text-slate-400'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('FEMALE')}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          gender === 'FEMALE'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-white/10 text-slate-400'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>

                {/* Age, Height, Weight */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Age (yrs)
                    </label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e: any) => setActivityLevel(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-xs outline-none focus:border-emerald-500"
                  >
                    <option value="SEDENTARY">Sedentary (Little or no exercise - 1.2x)</option>
                    <option value="LIGHT">Lightly Active (Exercise 1-3 days/week - 1.375x)</option>
                    <option value="MODERATE">Moderately Active (Exercise 3-5 days/week - 1.55x)</option>
                    <option value="VERY_ACTIVE">Very Active (Hard exercise 6-7 days/week - 1.725x)</option>
                    <option value="EXTRA_ACTIVE">Extra Active (Physical job or hard training - 1.9x)</option>
                  </select>
                </div>

                {/* Primary Fitness Goal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Primary Fitness Goal Strategy
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'WEIGHT_LOSS', label: 'Weight Loss', sub: '-500 kcal deficit' },
                      { id: 'MAINTAIN', label: 'Maintenance', sub: 'Maintain TDEE' },
                      { id: 'BULK', label: 'Muscle Bulk', sub: '+350 kcal surplus' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          goal === g.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">{g.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{g.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Live Calculated Output Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                      Metabolic Calculations
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">Calculated Results</h3>
                  </div>
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>

                {/* BMR & TDEE Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5">
                    <div className="text-[11px] text-slate-400 font-medium">BMR (Basal Rate)</div>
                    <div className="text-xl font-extrabold text-white mt-1">
                      {metabolics.bmr} <span className="text-xs text-slate-400">kcal</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5">
                    <div className="text-[11px] text-slate-400 font-medium">Maintenance TDEE</div>
                    <div className="text-xl font-extrabold text-blue-400 mt-1">
                      {metabolics.tdee} <span className="text-xs text-slate-400">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Daily Recommended Target Hero */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-center">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    Recommended Daily Target Calories
                  </div>
                  <div className="text-4xl font-black text-white mt-1">
                    {metabolics.targetCalories}{' '}
                    <span className="text-sm font-normal text-slate-400">kcal/day</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-2 font-medium">
                    Goal Strategy: <span className="text-emerald-300 font-bold">{goal}</span>
                  </div>
                </div>

                {/* Target Macros Breakdown */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Daily Macro Distribution
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-emerald-400 font-bold">PROTEIN</div>
                        <div className="text-base font-bold text-white">{metabolics.targetProtein}g</div>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">2.0g/kg</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-blue-500/20 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-blue-400 font-bold">CARBS</div>
                        <div className="text-base font-bold text-white">{metabolics.targetCarbs}g</div>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Balance</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-purple-400 font-bold">FAT</div>
                        <div className="text-base font-bold text-white">{metabolics.targetFat}g</div>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">25% Cal</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-amber-400 font-bold">FIBER</div>
                        <div className="text-base font-bold text-white">{metabolics.targetFiber}g</div>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Daily</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Sync New Targets to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

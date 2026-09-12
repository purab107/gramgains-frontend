'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, UserProfile } from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { AuthGuard } from '../../components/AuthGuard';
import { 
  Calculator, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Save
} from 'lucide-react';

function CalculatorPage() {
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

  const calculateMetabolics = () => {
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
    <div className="flex min-h-screen bg-[#F7F9F8] text-[#171C1B]">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-[#F7F9F8]">
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          userProfile={userProfile}
        />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E1E7E5] p-6 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A7C6E] uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4 text-[#0A7C6E]" />
                <span>Metabolic Science Calculator</span>
              </div>
              <h1 className="text-2xl font-bold text-[#171C1B] tracking-tight">
                TDEE & Target Macro Calculator
              </h1>
              <p className="text-xs text-[#68716F] mt-1">
                Calculate your Basal Metabolic Rate (BMR), Maintenance TDEE, and target protein/carbs/fat ratios.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-[#0A7C6E] hover:bg-[#075E54] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-[#0A7C6E]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Sync Targets'}</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-lg bg-[#E6F3F1] border border-[#B8E2DC] text-[#075E54] font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0A7C6E]" />
              <span>Profile updated! Your new TDEE and daily macro goals are now synced with your dashboard.</span>
            </div>
          )}

          {/* Grid Layout: Inputs Left, Live Results Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E1E7E5] p-6 rounded-xl shadow-sm space-y-5">
              <h2 className="text-base font-bold text-[#171C1B] flex items-center gap-2">
                <User className="w-4 h-4 text-[#0A7C6E]" />
                <span>Personal & Body Metrics</span>
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#68716F] mb-1">
                      Athlete Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Purab"
                      className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-[#171C1B] text-xs outline-none focus:border-[#0A7C6E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#68716F] mb-1">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('MALE')}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          gender === 'MALE'
                            ? 'bg-[#0A7C6E] border-[#0A7C6E] text-white'
                            : 'bg-white border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1]'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('FEMALE')}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          gender === 'FEMALE'
                            ? 'bg-[#0A7C6E] border-[#0A7C6E] text-white'
                            : 'bg-white border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1]'
                        }`}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                </div>

                {/* Age, Height, Weight */}
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="block text-xs font-sans font-semibold text-[#68716F] mb-1">
                      Age (yrs)
                    </label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-[#171C1B] text-xs font-semibold outline-none focus:border-[#0A7C6E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-[#68716F] mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-[#171C1B] text-xs font-semibold outline-none focus:border-[#0A7C6E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-[#68716F] mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-[#171C1B] text-xs font-semibold outline-none focus:border-[#0A7C6E]"
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-semibold text-[#68716F] mb-1">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e: any) => setActivityLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E1E7E5] rounded-lg text-[#171C1B] text-xs outline-none focus:border-[#0A7C6E]"
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
                  <label className="block text-xs font-semibold text-[#68716F] mb-1">
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
                        className={`p-3 rounded-lg border text-center transition-all ${
                          goal === g.id
                            ? 'bg-[#0A7C6E] border-[#0A7C6E] text-white font-bold'
                            : 'bg-white border-[#E1E7E5] text-[#171C1B] hover:bg-[#E6F3F1]'
                        }`}
                      >
                        <div className="text-xs font-bold">{g.label}</div>
                        <div className={`text-[10px] mt-0.5 ${goal === g.id ? 'text-teal-100' : 'text-[#68716F]'}`}>{g.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Live Calculated Output Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-[#FFFFFF] border border-[#E1E7E5] p-6 rounded-xl shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#E1E7E5] pb-3">
                  <div>
                    <span className="text-xs text-[#68716F] font-semibold uppercase tracking-wider">
                      Metabolic Calculations
                    </span>
                    <h3 className="text-lg font-bold text-[#171C1B] mt-0.5">Calculated Results</h3>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#0A7C6E]" />
                </div>

                {/* BMR & TDEE Cards */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-[#F7F9F8] border border-[#E1E7E5]">
                    <div className="text-[11px] text-[#68716F] font-sans font-medium">BMR (Basal Rate)</div>
                    <div className="text-lg font-bold text-[#171C1B] mt-1">
                      {metabolics.bmr} <span className="text-xs font-normal text-[#68716F]">kcal</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F7F9F8] border border-[#E1E7E5]">
                    <div className="text-[11px] text-[#68716F] font-sans font-medium">Maintenance TDEE</div>
                    <div className="text-lg font-bold text-[#171C1B] mt-1">
                      {metabolics.tdee} <span className="text-xs font-normal text-[#68716F]">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Daily Recommended Target Hero */}
                <div className="p-4 rounded-xl bg-[#0A7C6E] text-white text-center font-mono shadow-sm">
                  <div className="text-xs font-semibold font-sans uppercase tracking-wider text-teal-100">
                    Recommended Daily Target
                  </div>
                  <div className="text-3xl font-black text-white mt-1">
                    {metabolics.targetCalories}{' '}
                    <span className="text-xs font-normal text-teal-100">kcal/day</span>
                  </div>
                  <div className="text-xs text-teal-100 mt-1 font-sans">
                    Strategy: <span className="font-bold">{goal}</span>
                  </div>
                </div>

                {/* Target Macros Breakdown */}
                <div className="space-y-2 font-mono">
                  <div className="text-xs font-sans font-semibold text-[#171C1B] uppercase tracking-wider">
                    Daily Macro Distribution
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-[#E6F3F1] border border-[#B8E2DC] flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-[#075E54] font-sans font-bold">PROTEIN</div>
                        <div className="text-sm font-bold text-[#171C1B]">{metabolics.targetProtein}g</div>
                      </div>
                      <span className="text-[11px] text-[#68716F] font-mono">2.0g/kg</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#F7F9F8] border border-[#E1E7E5] flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-[#68716F] font-sans font-bold">CARBS</div>
                        <div className="text-sm font-bold text-[#171C1B]">{metabolics.targetCarbs}g</div>
                      </div>
                      <span className="text-[11px] text-[#68716F] font-mono">Balance</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#F7F9F8] border border-[#E1E7E5] flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-[#68716F] font-sans font-bold">FAT</div>
                        <div className="text-sm font-bold text-[#171C1B]">{metabolics.targetFat}g</div>
                      </div>
                      <span className="text-[11px] text-[#68716F] font-mono">25% Cal</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#F7F9F8] border border-[#E1E7E5] flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-[#68716F] font-sans font-bold">FIBER</div>
                        <div className="text-sm font-bold text-[#171C1B]">{metabolics.targetFiber}g</div>
                      </div>
                      <span className="text-[11px] text-[#68716F] font-mono">Daily</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 rounded-lg bg-[#0A7C6E] hover:bg-[#075E54] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-[#0A7C6E]"
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

export default function CalculatorPageGuarded() {
  return (
    <AuthGuard>
      <CalculatorPage />
    </AuthGuard>
  );
}

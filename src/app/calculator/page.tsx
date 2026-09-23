'use client';

import React, { useState, useEffect } from 'react';
import { ApiService, UserProfile } from '../../services/api';
import { MACRO_COLORS } from '@/lib/constants';
import { 
  Sidebar,
  Navbar,
  AuthGuard
} from '@/components';
import { AuthModal } from '@/components/auth/AuthModal';
import { useIsGuest } from '@/lib/guest-session';
import { 
  Calculator, 
  CheckCircle2, 
  Sparkles, 
  User, 
  Save,
  Lock,
  LogIn,
  Dna,
  Target,
  Zap
} from 'lucide-react';

function CalculatorPage() {
  const isGuest = useIsGuest();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
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
    // Remove loading class to prevent flash of unstyled content
    document.body.classList.remove('loading');
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userProfile={userProfile} />

      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <Navbar userProfile={userProfile} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-xl shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                <Calculator className="w-4 h-4 text-primary" />
                <span>Metabolic Science Calculator</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                TDEE & Target Macro Calculator
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Calculate your Basal Metabolic Rate (BMR), Maintenance TDEE, and target protein/carbs/fat ratios.
              </p>
            </div>

            {!isGuest && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-primary/20"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save & Sync Targets'}</span>
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Profile updated! Your new TDEE and daily macro goals are now synced with your dashboard.</span>
            </div>
          )}

          {/* Guest Locked State */}
          {isGuest ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                {/* Locked Header */}
                <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-background p-8 flex flex-col items-center gap-3 border-b border-border">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Lock className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground">Macro Calculator</h2>
                    <p className="text-sm text-muted-foreground mt-1">Sign in to unlock personalized calculations</p>
                  </div>
                  <div className="absolute top-3 right-3 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-1">
                    <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Guest Mode</span>
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="p-6 space-y-3">
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    The Metabolic Science Calculator uses your body metrics to calculate personalized BMR, TDEE, and macro targets — then syncs them directly to your daily tracker.
                  </p>

                  {[
                    { icon: Dna, title: 'Personalized BMR & TDEE', desc: 'Mifflin-St Jeor formula calibrated to your age, height, weight & activity.' },
                    { icon: Target, title: 'Goal-based Macro Splits', desc: 'Auto-calculated protein, carb & fat ratios for weight loss, maintenance, or bulk.' },
                    { icon: Zap, title: 'Instant Tracker Sync', desc: 'Save your targets once and every dashboard chart updates automatically.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="px-6 pb-6 flex flex-col gap-2">
                  <button
                    id="guest-calc-signin-btn"
                    onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-all active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Calculate</span>
                  </button>
                  <button
                    id="guest-calc-register-btn"
                    onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card hover:bg-muted py-3 text-sm font-medium text-foreground transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Create Free Account</span>
                  </button>
                </div>
              </div>

              <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                defaultMode={authMode}
                onSuccess={() => {
                  setIsAuthOpen(false);
                  window.location.replace('/calculator');
                }}
              />
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-7 bg-card border border-border p-6 rounded-xl shadow-sm space-y-5">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <span>Personal & Body Metrics</span>
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Athlete Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Purab"
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGender('MALE')}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          gender === 'MALE'
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-card border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                        }`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('FEMALE')}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          gender === 'FEMALE'
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-card border-border text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30'
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
                    <label className="block text-xs font-sans font-semibold text-muted-foreground mb-1">
                      Age (yrs)
                    </label>
                    <input
                      type="number"
                      min="12"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-muted-foreground mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-semibold text-muted-foreground mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e: any) => setActivityLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-xs outline-none focus:border-primary"
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
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
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
                            ? 'bg-primary border-primary text-primary-foreground font-bold'
                            : 'bg-card border-border text-foreground hover:bg-primary/10 hover:border-primary/30'
                        }`}
                      >
                        <div className="text-xs font-bold">{g.label}</div>
                        <div className={`text-[10px] mt-0.5 ${goal === g.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{g.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Live Calculated Output Column */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                      Metabolic Calculations
                    </span>
                    <h3 className="text-lg font-bold text-foreground mt-0.5">Calculated Results</h3>
                  </div>
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>

                {/* BMR & TDEE Cards */}
                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <div className="text-[11px] text-muted-foreground font-sans font-medium">BMR (Basal Rate)</div>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {metabolics.bmr} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40 border border-border">
                    <div className="text-[11px] text-muted-foreground font-sans font-medium">Maintenance TDEE</div>
                    <div className="text-lg font-bold text-foreground mt-1">
                      {metabolics.tdee} <span className="text-xs font-normal text-muted-foreground">kcal</span>
                    </div>
                  </div>
                </div>

                {/* Daily Recommended Target Hero */}
                <div className="p-4 rounded-xl bg-primary text-primary-foreground text-center font-mono shadow-sm">
                  <div className="text-xs font-semibold font-sans uppercase tracking-wider text-primary-foreground/80">
                    Recommended Daily Target
                  </div>
                  <div className="text-3xl font-black text-primary-foreground mt-1">
                    {metabolics.targetCalories}{' '}
                    <span className="text-xs font-normal text-primary-foreground/80">kcal/day</span>
                  </div>
                  <div className="text-xs text-primary-foreground/80 mt-1 font-sans">
                    Strategy: <span className="font-bold">{goal}</span>
                  </div>
                </div>

                {/* Target Macros Breakdown */}
                <div className="space-y-2 font-mono">
                  <div className="text-xs font-sans font-semibold text-foreground uppercase tracking-wider">
                    Daily Macro Distribution
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg border flex justify-between items-center" style={{ backgroundColor: `${MACRO_COLORS.protein}15`, borderColor: `${MACRO_COLORS.protein}35` }}>
                      <div>
                        <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.protein }}>PROTEIN</div>
                        <div className="text-sm font-bold text-foreground">{metabolics.targetProtein}g</div>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">2.0g/kg</span>
                    </div>

                    <div className="p-2.5 rounded-lg border flex justify-between items-center" style={{ backgroundColor: `${MACRO_COLORS.carbs}15`, borderColor: `${MACRO_COLORS.carbs}35` }}>
                      <div>
                        <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.carbs }}>CARBS</div>
                        <div className="text-sm font-bold text-foreground">{metabolics.targetCarbs}g</div>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">Balance</span>
                    </div>

                    <div className="p-2.5 rounded-lg border flex justify-between items-center" style={{ backgroundColor: `${MACRO_COLORS.fat}15`, borderColor: `${MACRO_COLORS.fat}35` }}>
                      <div>
                        <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.fat }}>FAT</div>
                        <div className="text-sm font-bold text-foreground">{metabolics.targetFat}g</div>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">25% Cal</span>
                    </div>

                    <div className="p-2.5 rounded-lg border flex justify-between items-center" style={{ backgroundColor: `${MACRO_COLORS.fiber}15`, borderColor: `${MACRO_COLORS.fiber}35` }}>
                      <div>
                        <div className="text-[10px] font-sans font-bold" style={{ color: MACRO_COLORS.fiber }}>FIBER</div>
                        <div className="text-sm font-bold text-foreground">{metabolics.targetFiber}g</div>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">Daily</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-primary/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Sync New Targets to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
          )}
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

/**
 * EligibilityWizard.tsx
 *
 * A multi-step eligibility wizard modal for the Government Schemes page.
 * Steps: Personal → Farm → Agriculture → Income → Review
 * Submits to POST /api/government-schemes/eligibility
 * Shows results with Eligible / Possibly Eligible / Not Eligible breakdown.
 *
 * Rules:
 *  - Desktop: centered modal
 *  - Mobile: fullscreen modal
 *  - No UI redesign — AgroSaathi design language
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, User, Tractor, Wheat,
  IndianRupee, ClipboardCheck, Loader2, CheckCircle2,
  HelpCircle, XCircle, ExternalLink, FileText
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Farm', icon: Tractor },
  { id: 3, label: 'Agriculture', icon: Wheat },
  { id: 4, label: 'Income', icon: IndianRupee },
  { id: 5, label: 'Review', icon: ClipboardCheck },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

const CROPS = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Soybean',
  'Sunflower', 'Mustard', 'Jowar', 'Bajra', 'Ragi', 'Pulses', 'Lentils',
  'Chickpea', 'Pigeon Pea', 'Mung Bean', 'Urad Bean', 'Onion', 'Potato',
  'Tomato', 'Brinjal', 'Okra', 'Banana', 'Mango', 'Papaya', 'Coconut',
  'Arecanut', 'Cashew', 'Jute', 'Turmeric', 'Ginger', 'Cardamom', 'Pepper',
  'Other',
];

interface FormData {
  // Step 1: Personal
  age: number | '';
  gender: string;
  state: string;
  district: string;
  // Step 2: Farm
  farmSize: number | '';
  landOwnership: string;
  irrigationType: string;
  farmerType: string;
  // Step 3: Agriculture
  primaryCrop: string;
  secondaryCrop: string;
  organicFarming: string;
  livestock: string;
  // Step 4: Income
  annualIncome: number | '';
  caste: string;
  existingBenefits: string;
}

const initialForm: FormData = {
  age: '',
  gender: '',
  state: '',
  district: '',
  farmSize: '',
  landOwnership: '',
  irrigationType: '',
  farmerType: '',
  primaryCrop: '',
  secondaryCrop: '',
  organicFarming: 'No',
  livestock: '',
  annualIncome: '',
  caste: '',
  existingBenefits: '',
};

interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  eligibilityStatus: 'Eligible' | 'Possibly Eligible' | 'Not Eligible';
  eligibilityPercentage: number;
  reasons: string[];
  // Extended data from backend (joined)
  benefits?: string[];
  requiredDocuments?: string[];
  officialWebsite?: string | null;
  ministry?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-bold text-gray-700 mb-2">{children}</label>;
}

function SelectField({
  value, onChange, children, placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all appearance-none cursor-pointer"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

function NumberField({
  value, onChange, placeholder, min, max, step
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
    />
  );
}

function TextField({
  value, onChange, placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
    />
  );
}

// ── Eligibility Result Card ───────────────────────────────────────────────────

function ResultCard({ result }: { result: EligibilityResult }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    'Eligible': {
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      bar: 'bg-emerald-400',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    'Possibly Eligible': {
      bg: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
      bar: 'bg-amber-400',
      icon: HelpCircle,
      iconColor: 'text-amber-500',
    },
    'Not Eligible': {
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700 border-red-200',
      bar: 'bg-red-400',
      icon: XCircle,
      iconColor: 'text-red-400',
    },
  };

  const cfg = statusConfig[result.eligibilityStatus];
  const Icon = cfg.icon;

  return (
    <div className={`rounded-2xl border p-5 ${cfg.bg} transition-all`}>
      <div className="flex items-start gap-3 mb-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1">{result.schemeName}</h4>
          {result.ministry && (
            <p className="text-xs text-gray-500 mb-2">{result.ministry}</p>
          )}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>
              {result.eligibilityStatus}
            </span>
            <span className="text-xs font-bold text-gray-600">{result.eligibilityPercentage}% match</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-200 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${cfg.bar}`}
          style={{ width: `${result.eligibilityPercentage}%` }}
        />
      </div>

      {/* Reasons (always show top reason) */}
      {result.reasons.length > 0 && (
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          {result.reasons[0]}
        </p>
      )}

      {/* Expandable details */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors mb-2"
      >
        {expanded ? '▲ Hide Details' : '▼ View Details'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* All reasons */}
            {result.reasons.length > 1 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Reasons</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-gray-400 mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {result.benefits && result.benefits.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Benefits</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {result.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Documents */}
            {result.requiredDocuments && result.requiredDocuments.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Required Documents</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {result.requiredDocuments.map((d, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <FileText className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Website */}
            {result.officialWebsite && (
              <a
                href={result.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 transition-colors mt-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Apply on Official Website
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────

interface EligibilityWizardProps {
  onClose: () => void;
}

export function EligibilityWizard({ onClose }: EligibilityWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<EligibilityResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Fetch saved profile on mount
  useEffect(() => {
    fetch('http://localhost:8020/api/government-schemes/eligibility/profile')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          const p = json.data;
          setForm(prev => ({
            ...prev,
            age: p.age || prev.age,
            gender: p.gender || prev.gender,
            state: p.state || prev.state,
            district: p.district || prev.district,
            farmSize: p.farmSize || prev.farmSize,
            landOwnership: p.landOwnership || prev.landOwnership,
            irrigationType: p.irrigationType || prev.irrigationType,
            farmerType: p.farmerType || prev.farmerType,
            primaryCrop: p.crop || prev.primaryCrop, // Note: crop maps to primaryCrop
            secondaryCrop: p.secondaryCrop || prev.secondaryCrop,
            organicFarming: p.organicFarming || prev.organicFarming,
            livestock: p.livestock || prev.livestock,
            annualIncome: p.annualIncome || prev.annualIncome,
            caste: p.caste || prev.caste,
            existingBenefits: p.existingBenefits || prev.existingBenefits,
          }));
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  const set = <K extends keyof FormData>(key: K, val: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: val }));
  };

  const canAdvance = (): boolean => {
    if (step === 1) return !!(form.age && form.gender && form.state);
    if (step === 2) return !!(form.farmSize && form.landOwnership && form.farmerType);
    if (step === 3) return !!form.primaryCrop;
    if (step === 4) return !!(form.annualIncome !== '' && form.caste);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        state: form.state,
        farmSize: Number(form.farmSize),
        farmerType: form.farmerType,
        crop: form.primaryCrop,
        annualIncome: Number(form.annualIncome),
        gender: form.gender,
        age: Number(form.age),
        caste: form.caste,
        landOwnership: form.landOwnership,
        // Extra fields for saved profile
        district: form.district,
        irrigationType: form.irrigationType,
        secondaryCrop: form.secondaryCrop,
        organicFarming: form.organicFarming,
        livestock: form.livestock,
        existingBenefits: form.existingBenefits,
      };

      const res = await fetch('http://localhost:8020/api/government-schemes/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Something went wrong. Please try again.');
        return;
      }

      // Fetch scheme details to enrich results with benefits/documents/website
      const enriched: EligibilityResult[] = await Promise.all(
        (json.data as EligibilityResult[]).map(async (r) => {
          try {
            const detailRes = await fetch(`http://localhost:8020/api/government-schemes/${r.schemeId}`);
            const detailJson = await detailRes.json();
            if (detailJson.success && detailJson.data) {
              return {
                ...r,
                benefits: detailJson.data.benefits,
                requiredDocuments: detailJson.data.requiredDocuments,
                officialWebsite: detailJson.data.officialWebsite,
                ministry: detailJson.data.ministry,
              };
            }
          } catch { /* ignore enrichment failures */ }
          return r;
        })
      );

      setResults(enriched);
    } catch {
      setError('Network error. Make sure the Government Schemes backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  const eligible = results?.filter(r => r.eligibilityStatus === 'Eligible') ?? [];
  const possibly = results?.filter(r => r.eligibilityStatus === 'Possibly Eligible') ?? [];
  const notEligible = results?.filter(r => r.eligibilityStatus === 'Not Eligible') ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[88vh] z-10 overflow-hidden"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Eligibility Check</h2>
            <p className="text-sm text-gray-500">Find schemes you qualify for</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress Steps (hidden when showing results) */}
        {!results && (
          <div className="flex items-center gap-0 px-6 py-4 border-b border-gray-100 overflow-x-auto flex-shrink-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = step > s.id;
              const isActive = step === s.id;
              return (
                <div key={s.id} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
                    isDone ? 'bg-green-100 text-green-700' :
                    isActive ? 'bg-green-400 text-white shadow-sm' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{i + 1}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px mx-1 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AnimatePresence mode="wait">
            {/* ── RESULTS ── */}
            {results ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-2xl border border-green-100">
                  <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">Analysis Complete!</p>
                    <p className="text-sm text-gray-600">
                      Found <strong>{eligible.length}</strong> eligible, <strong>{possibly.length}</strong> possibly eligible, and <strong>{notEligible.length}</strong> not eligible schemes.
                    </p>
                  </div>
                </div>

                {eligible.length > 0 && (
                  <section className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Eligible Schemes ({eligible.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                      {eligible.map(r => <ResultCard key={r.schemeId} result={r} />)}
                    </div>
                  </section>
                )}

                {possibly.length > 0 && (
                  <section className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-500" /> Possibly Eligible ({possibly.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                      {possibly.map(r => <ResultCard key={r.schemeId} result={r} />)}
                    </div>
                  </section>
                )}

                {notEligible.length > 0 && (
                  <section className="mb-6">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" /> Not Eligible ({notEligible.length})
                    </h3>
                    <div className="flex flex-col gap-3">
                      {notEligible.map(r => <ResultCard key={r.schemeId} result={r} />)}
                    </div>
                  </section>
                )}
              </motion.div>
            ) : (
              /* ── WIZARD STEPS ── */
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* ── STEP 1: Personal ── */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Personal Information</h3>
                      <p className="text-sm text-gray-500">Tell us about yourself to find relevant schemes.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Age *</FieldLabel>
                        <NumberField value={form.age} onChange={v => set('age', v)} placeholder="e.g. 35" min={18} max={100} />
                      </div>
                      <div>
                        <FieldLabel>Gender *</FieldLabel>
                        <SelectField value={form.gender} onChange={v => set('gender', v)} placeholder="Select gender">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </SelectField>
                      </div>
                    </div>
                    <div>
                      <FieldLabel>State *</FieldLabel>
                      <SelectField value={form.state} onChange={v => set('state', v)} placeholder="Select your state">
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </SelectField>
                    </div>
                    <div>
                      <FieldLabel>District</FieldLabel>
                      <TextField value={form.district} onChange={v => set('district', v)} placeholder="e.g. Mysuru (optional)" />
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Farm ── */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Farm Information</h3>
                      <p className="text-sm text-gray-500">Details about your farm and ownership.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Farm Size (hectares) *</FieldLabel>
                        <NumberField value={form.farmSize} onChange={v => set('farmSize', v)} placeholder="e.g. 2.5" min={0.1} step={0.5} />
                      </div>
                      <div>
                        <FieldLabel>Land Ownership *</FieldLabel>
                        <SelectField value={form.landOwnership} onChange={v => set('landOwnership', v)} placeholder="Select type">
                          <option value="Owned">Owned</option>
                          <option value="Leased">Leased</option>
                          <option value="Tenant">Tenant</option>
                        </SelectField>
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Irrigation Type</FieldLabel>
                      <SelectField value={form.irrigationType} onChange={v => set('irrigationType', v)} placeholder="Select irrigation">
                        <option value="Canal">Canal Irrigation</option>
                        <option value="Borewell">Borewell / Tubewell</option>
                        <option value="Drip">Drip Irrigation</option>
                        <option value="Sprinkler">Sprinkler</option>
                        <option value="Rainfed">Rainfed (No Irrigation)</option>
                        <option value="Other">Other</option>
                      </SelectField>
                    </div>
                    <div>
                      <FieldLabel>Farmer Type *</FieldLabel>
                      <SelectField value={form.farmerType} onChange={v => set('farmerType', v)} placeholder="Select farmer type">
                        <option value="Individual">Individual Farmer</option>
                        <option value="Tenant">Tenant Farmer</option>
                        <option value="SHG">Self Help Group (SHG)</option>
                        <option value="FPO">Farmer Producer Organization (FPO)</option>
                      </SelectField>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Agriculture ── */}
                {step === 3 && (
                  <div className="flex flex-col gap-5">
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Agriculture</h3>
                      <p className="text-sm text-gray-500">Tell us about the crops you grow.</p>
                    </div>
                    <div>
                      <FieldLabel>Primary Crop *</FieldLabel>
                      <SelectField value={form.primaryCrop} onChange={v => set('primaryCrop', v)} placeholder="Select your main crop">
                        {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                      </SelectField>
                    </div>
                    <div>
                      <FieldLabel>Secondary Crop</FieldLabel>
                      <SelectField value={form.secondaryCrop} onChange={v => set('secondaryCrop', v)} placeholder="Optional secondary crop">
                        {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                      </SelectField>
                    </div>
                    <div>
                      <FieldLabel>Organic Farming</FieldLabel>
                      <div className="flex gap-3">
                        {['Yes', 'No'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => set('organicFarming', opt)}
                            className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                              form.organicFarming === opt
                                ? 'bg-green-400 border-green-400 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Livestock (optional)</FieldLabel>
                      <TextField value={form.livestock} onChange={v => set('livestock', v)} placeholder="e.g. Cattle, Goats, Poultry" />
                    </div>
                  </div>
                )}

                {/* ── STEP 4: Income ── */}
                {step === 4 && (
                  <div className="flex flex-col gap-5">
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Income & Category</h3>
                      <p className="text-sm text-gray-500">Income and social category details for accurate matching.</p>
                    </div>
                    <div>
                      <FieldLabel>Annual Income (₹) *</FieldLabel>
                      <NumberField value={form.annualIncome} onChange={v => set('annualIncome', v)} placeholder="e.g. 120000" min={0} step={1000} />
                      <p className="text-xs text-gray-400 mt-1.5">Enter total annual household income in Indian Rupees</p>
                    </div>
                    <div>
                      <FieldLabel>Social Category *</FieldLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {['General', 'OBC', 'SC', 'ST'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => set('caste', cat)}
                            className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                              form.caste === cat
                                ? 'bg-green-400 border-green-400 text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Existing Government Benefits</FieldLabel>
                      <TextField value={form.existingBenefits} onChange={v => set('existingBenefits', v)} placeholder="e.g. PM-KISAN, MNREGA (optional)" />
                    </div>
                  </div>
                )}

                {/* ── STEP 5: Review ── */}
                {step === 5 && (
                  <div className="flex flex-col gap-4">
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Review & Submit</h3>
                      <p className="text-sm text-gray-500">Confirm your details before checking eligibility.</p>
                    </div>

                    {[
                      {
                        title: 'Personal',
                        fields: [
                          ['Age', form.age],
                          ['Gender', form.gender],
                          ['State', form.state],
                          form.district ? ['District', form.district] : null,
                        ]
                      },
                      {
                        title: 'Farm',
                        fields: [
                          ['Farm Size', form.farmSize ? `${form.farmSize} hectares` : '—'],
                          ['Land Ownership', form.landOwnership],
                          ['Farmer Type', form.farmerType],
                          form.irrigationType ? ['Irrigation', form.irrigationType] : null,
                        ]
                      },
                      {
                        title: 'Agriculture',
                        fields: [
                          ['Primary Crop', form.primaryCrop],
                          form.secondaryCrop ? ['Secondary Crop', form.secondaryCrop] : null,
                          ['Organic Farming', form.organicFarming],
                          form.livestock ? ['Livestock', form.livestock] : null,
                        ]
                      },
                      {
                        title: 'Income',
                        fields: [
                          ['Annual Income', form.annualIncome ? `₹${Number(form.annualIncome).toLocaleString('en-IN')}` : '—'],
                          ['Category', form.caste],
                          form.existingBenefits ? ['Existing Benefits', form.existingBenefits] : null,
                        ]
                      },
                    ].map(section => (
                      <div key={section.title} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{section.title}</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {section.fields.filter(Boolean).map(([label, val]) => (
                            <div key={String(label)}>
                              <p className="text-xs text-gray-500">{label}</p>
                              <p className="text-sm font-semibold text-gray-900">{String(val) || '—'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-5 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0 bg-white">
          {results ? (
            <>
              <button
                onClick={() => { setResults(null); setStep(1); setForm(initialForm); }}
                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Start Over
              </button>
              <button
                onClick={onClose}
                className="bg-[#B8F24A] hover:bg-[#a5db40] text-[#0a1f12] font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Done
              </button>
            </>
          ) : (
            <>
              {step > 1 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canAdvance()}
                  className="flex items-center gap-2 bg-[#B8F24A] hover:bg-[#a5db40] disabled:bg-gray-100 disabled:text-gray-400 text-[#0a1f12] font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#B8F24A] hover:bg-[#a5db40] disabled:bg-gray-100 disabled:text-gray-400 text-[#0a1f12] font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                  ) : (
                    <><CheckCircle2 className="w-4 h-4" /> Check Eligibility</>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

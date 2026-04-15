/**
 * ContratacionPage - Flujo: plan → mascota → pago (C1+C2+C3 con MP o C2+C3 con método guardado)
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlans, usePlan } from '@modules/plans/presentation/hooks/usePlans';
import type { Plan, Coverage } from '@modules/plans/application/dto/PlanDTO';
import { usePetsList, useCreatePet } from '@modules/pets/presentation/hooks/usePets';
import { usePaymentMethods, useSubscriptions } from '@modules/billing/presentation/hooks/useBilling';
import { getPetIdsWithOpenSubscription } from '@modules/billing/application/subscription-conflict';
import { PaymentForm } from '@modules/billing/presentation/components/PaymentForm';
import { SubscribeBatchForm } from '@modules/billing/presentation/components/SubscribeBatchForm';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { cn } from '@shared/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  age?: number;
  photoUrl?: string | null;
}

/** Referencia aproximada UF→CLP solo para mostrar montos al usuario (el cobro lo define el backend). */
const UF_CLP_APPROX = 37000;

type ContractLine = { id: string; petId: string; planId: string };

// ─── Pet selector card ────────────────────────────────────────────────────────

const SPECIES_EMOJI: Record<string, string> = {
  perro: '🐶', gato: '🐱', dog: '🐶', cat: '🐱',
};

function speciesEmoji(species?: string) {
  if (!species) return '🐾';
  return SPECIES_EMOJI[species.toLowerCase()] ?? '🐾';
}

function PetSelectCard({
  pet,
  selected,
  onClick,
  disabled,
  disabledReason,
}: {
  pet: Pet;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  /** Tooltip cuando está deshabilitada (p. ej. ya tiene plan). */
  disabledReason?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={cn(
        'relative flex flex-col rounded-2xl overflow-hidden border-2 text-left',
        'transition-all duration-150 focus:outline-none',
        disabled && 'opacity-45 cursor-not-allowed',
        selected
          ? 'border-[#FF6F61] shadow-md ring-2 ring-[#FF6F61]/20'
          : 'border-gray-100 bg-white hover:border-[#FF6F61]/40 hover:shadow-sm',
      )}
    >
      {/* Selected checkmark */}
      {selected && (
        <span className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#FF6F61] flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}

      {/* Photo */}
      <div className={cn(
        'flex items-center justify-center h-24',
        selected ? 'bg-[#FFDCE6]/60' : 'bg-[#FFDCE6]/30',
      )}>
        {pet.photoUrl ? (
          <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl select-none">{speciesEmoji(pet.species)}</span>
        )}
      </div>

      {/* Info */}
      <div className={cn(
        'px-3 py-2.5',
        selected ? 'bg-[#FF6F61]/5' : 'bg-white',
      )}>
        <p className="font-semibold text-gray-900 text-sm truncate">{pet.name}</p>
        {(pet.species || pet.age) && (
          <p className="text-xs text-gray-400 capitalize truncate mt-0.5">
            {[pet.species, pet.age != null ? `${pet.age}a` : null].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </button>
  );
}

function PlanSelectCard({
  plan,
  selected,
  onClick,
}: {
  plan: Plan;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-2xl overflow-hidden border-2 text-left',
        'transition-all duration-150 focus:outline-none min-h-[132px]',
        selected
          ? 'border-[#FF6F61] shadow-md ring-2 ring-[#FF6F61]/20'
          : 'border-gray-100 bg-white hover:border-[#FF6F61]/40 hover:shadow-sm',
      )}
    >
      {selected && (
        <span className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#FF6F61] flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}

      <div
        className={cn(
          'flex items-center justify-center h-20 shrink-0',
          selected ? 'bg-[#FF6F61]/10' : 'bg-violet-50',
        )}
      >
        {plan.imageUrl ? (
          <img src={plan.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl select-none" aria-hidden>📋</span>
        )}
      </div>

      <div className={cn('px-3 py-2.5 flex-1 flex flex-col', selected ? 'bg-[#FF6F61]/5' : 'bg-white')}>
        <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{plan.name}</p>
        <p className="text-xs text-[#FF6F61] font-medium mt-1">{plan.basePriceUf} UF/mes</p>
        {plan.tier && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5 truncate">{plan.tier}</p>
        )}
      </div>
    </button>
  );
}

function sortedCoverages(plan: Plan | undefined): Coverage[] {
  return [...(plan?.coverages ?? [])].sort(
    (a, b) => (a.coverageType?.displayOrder ?? 0) - (b.coverageType?.displayOrder ?? 0),
  );
}

function formatMaxEvent(c: Coverage): string | null {
  const parts: string[] = [];
  if (c.maxAmountPerEventUf != null && c.maxAmountPerEventUf > 0) {
    parts.push(`${c.maxAmountPerEventUf} UF`);
  }
  if (c.maxAmountPerEventClp != null && c.maxAmountPerEventClp > 0) {
    parts.push(`~${c.maxAmountPerEventClp.toLocaleString('es-CL')} CLP`);
  }
  return parts.length ? `${parts.join(' · ')} / evento` : "Sin Tope";
}

function PlanCoveragePanel({
  plan,
  isLoading,
  ufClpApprox,
  heading,
}: {
  plan: Plan | undefined;
  isLoading: boolean;
  ufClpApprox: number;
  heading?: string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-20 bg-gray-50 rounded-lg mt-4" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white/90 p-5 text-sm text-gray-500">
        {heading ?? 'Selecciona un plan en el panel izquierdo para ver aquí coberturas, topes y eventos.'}
      </div>
    );
  }

  const coverages = sortedCoverages(plan);
  const clpRef = Math.round(plan.basePriceUf * ufClpApprox);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div
        className="px-4 py-3 border-b border-gray-100"
        style={plan.color ? { borderLeftWidth: 4, borderLeftColor: plan.color } : undefined}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FF6F61]">
          {heading ?? 'Plan seleccionado'}
        </p>
        <div className="flex gap-3 mt-1">
          {plan.imageUrl ? (
            <img
              src={plan.imageUrl}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-violet-50 flex items-center justify-center text-2xl shrink-0">
              📋
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-gray-900 text-base leading-tight">{plan.name}</h2>
            {plan.tier ? (
              <p className="text-[11px] text-gray-500 uppercase tracking-wide mt-0.5">{plan.tier}</p>
            ) : null}
            <p className="text-sm text-[#FF6F61] font-semibold mt-1">
              {plan.basePriceUf} UF/mes
              <span className="text-gray-500 font-normal text-xs"> (~{clpRef.toLocaleString('es-CL')} CLP)</span>
            </p>
          </div>
        </div>
        {plan.description?.trim() ? (
          <p className="text-xs text-gray-600 mt-3 leading-relaxed border-t border-gray-100 pt-3">
            {plan.description.trim()}
          </p>
        ) : null}
        {plan.termsPdfUrl ? (
          <a
            href={plan.termsPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-[#FF6F61] font-medium mt-2 hover:underline"
          >
            Ver términos y condiciones (PDF)
          </a>
        ) : null}
      </div>

      <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-800">Coberturas y prestaciones</p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Revisa cada ítem: porcentaje, tope por evento y cuántos eventos al año cubre este plan.
        </p>
      </div>

      <ul className="max-h-[min(55vh,520px)] overflow-y-auto divide-y divide-gray-100">
        {coverages.length === 0 ? (
          <li className="px-4 py-6 text-sm text-gray-500 text-center">
            No hay coberturas detalladas para este plan. Consulta en{' '}
            <Link to="/planes-y-coberturas" className="text-[#FF6F61] underline font-medium">
              Planes y coberturas
            </Link>
            .
          </li>
        ) : (
          coverages.map((c) => {
            const ct = c.coverageType;
            const maxLine = formatMaxEvent(c);
            return (
              <li key={c.id} className="px-4 py-3.5 hover:bg-gray-50/60">
                <p className="font-medium text-gray-900 text-sm">{ct.name}</p>
                {ct.description?.trim() ? (
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{ct.description.trim()}</p>
                ) : null}
                <dl className="mt-2 grid gap-1 text-[11px] text-gray-700">
                  {c.coveragePercentage != null ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">Cobertura</dt>
                      <dd className="font-medium tabular-nums">{c.coveragePercentage}%</dd>
                    </div>
                  ) : null}
                  {maxLine ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">Tope / evento</dt>
                      <dd className="text-right font-medium">{maxLine}</dd>
                    </div>
                  ) : null}
                  {c.maxAnnualEvents != null && c.maxAnnualEvents > 0 ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-gray-500">Eventos al año</dt>
                      <dd className="font-medium tabular-nums">{c.maxAnnualEvents}</dd>
                    </div>
                  ) : null}
                </dl>
                {c.disclaimer?.trim() ? (
                  <p className="text-[10px] text-amber-800 bg-amber-50/80 rounded-md px-2 py-1.5 mt-2">
                    {c.disclaimer.trim()}
                  </p>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function PlanCoveragePanelFromId({
  planId,
  ufClpApprox,
  subtitle,
}: {
  planId: string;
  ufClpApprox: number;
  subtitle?: string;
}) {
  const { data: plan, isLoading } = usePlan(planId, true);
  return (
    <PlanCoveragePanel
      plan={plan}
      isLoading={isLoading}
      ufClpApprox={ufClpApprox}
      heading={subtitle ?? 'Plan en tu contrato'}
    />
  );
}

/** Elección inicial: armar líneas mascota+plan y un solo cobro al final. */
function ContractModeCard({
  title,
  description,
  selected,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-2xl border-2 p-4 text-left transition-all duration-150 focus:outline-none',
        selected
          ? 'border-[#FF6F61] bg-[#FF6F61]/5 shadow-md ring-2 ring-[#FF6F61]/20'
          : 'border-gray-200 bg-white hover:border-[#FF6F61]/40 hover:shadow-sm',
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#FF6F61] flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      <span className="text-3xl mb-2" aria-hidden>
        {icon}
      </span>
      <p className="font-semibold text-gray-900 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{description}</p>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ContratacionPage() {
  const location = useLocation();
  const planIdFromState = (location.state as { planId?: string } | null)?.planId;

  const { data: plans = [] } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const appliedNavPlanIdRef = useRef<string | undefined>(undefined);

  const { data: selectedPlan, isLoading: selectedPlanLoading } = usePlan(selectedPlanId || undefined);

  /**
   * - Si viene `planId` por navegación (desde /planes), aplicarlo solo cuando cambia (no pisar elección manual).
   * - Si no hay plan válido seleccionado, usar el primero de la lista publicada.
   */
  useEffect(() => {
    if (plans.length === 0) {
      setSelectedPlanId('');
      return;
    }

    if (planIdFromState && plans.some((p) => p.id === planIdFromState)) {
      if (appliedNavPlanIdRef.current !== planIdFromState) {
        appliedNavPlanIdRef.current = planIdFromState;
        setSelectedPlanId(planIdFromState);
        return;
      }
    } else {
      appliedNavPlanIdRef.current = undefined;
    }

    setSelectedPlanId((current) => {
      if (current && plans.some((p) => p.id === current)) return current;
      return plans[0].id;
    });
  }, [plans, planIdFromState]);
  const { data: pets = [] } = usePetsList();
  const createPetMutation = useCreatePet();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: subscriptions = [], isLoading: subsLoading } = useSubscriptions();

  const petsWithOpenPlan = useMemo(
    () => getPetIdsWithOpenSubscription(subscriptions),
    [subscriptions],
  );

  /** unset = elegir tipo; existing = mascotas en cuenta; new = registrar mascota(s) y armar líneas */
  const [contractMode, setContractMode] = useState<'unset' | 'existing' | 'new'>('unset');

  /** Líneas confirmadas: cada una es una mascota + su plan (pueden diferir). */
  const [contractLines, setContractLines] = useState<ContractLine[]>([]);
  /** Selección actual (una mascota) antes de pulsar «Añadir al contrato». */
  const [draftPetId, setDraftPetId] = useState<string | null>(null);
  const isNewPetFlow = contractMode === 'new';
  const isExistingPetFlow = contractMode === 'existing';

  const usedPetIds = useMemo(
    () => new Set(contractLines.map((l) => l.petId)),
    [contractLines],
  );
  const batchItems = useMemo(
    () => contractLines.map(({ petId, planId }) => ({ petId, planId })),
    [contractLines],
  );
  const totals = useMemo(() => {
    let uf = 0;
    for (const line of contractLines) {
      const p = plans.find((pl) => pl.id === line.planId);
      if (p) uf += p.basePriceUf;
    }
    return { uf, clpApprox: Math.round(uf * UF_CLP_APPROX) };
  }, [contractLines, plans]);

  const uniqueContractPlanIds = useMemo(
    () => [...new Set(contractLines.map((l) => l.planId))],
    [contractLines],
  );

  // New pet form
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'DOG' | 'CAT'>('DOG');
  const [petBirthDate, setPetBirthDate] = useState('');
  const [isSterilized, setIsSterilized] = useState(false);
  const [hasDisease, setHasDisease] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [hasMinorDisease, setHasMinorDisease] = useState(false);
  const [acceptsTOS, setAcceptsTOS] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [step, setStep] = useState<'pet' | 'subscription' | 'done'>('pet');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentMode, setPaymentMode] = useState<'saved' | 'new'>('new');

  useEffect(() => {
    if (step !== 'subscription') return;
    setPaymentMode(paymentMethods.length > 0 ? 'saved' : 'new');
  }, [step, paymentMethods.length]);

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };
  const clearAllErrors = () => setFieldErrors({});

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !petBirthDate) {
      toast.error('Nombre y fecha de nacimiento son obligatorios');
      return;
    }
    if (!acceptsTOS) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }
    if (!selectedPlanId) {
      toast.error('Selecciona un plan antes de registrar la mascota');
      return;
    }
    try {
      const pet = await createPetMutation.mutateAsync({
        name: petName.trim(),
        species: petSpecies,
        birthDate: petBirthDate,
        isSterilized,
        disease: hasDisease,
        restricted: isRestricted,
        minorDisease: hasMinorDisease,
        tos: acceptsTOS,
      });
      setContractLines((prev) => [
        ...prev,
        { id: crypto.randomUUID(), petId: pet.id, planId: selectedPlanId },
      ]);
      clearAllErrors();
      setPetName('');
      setPetBirthDate('');
      setIsSterilized(false);
      setHasDisease(false);
      setIsRestricted(false);
      setHasMinorDisease(false);
      setAcceptsTOS(false);
      toast.success('Mascota agregada al contrato. Puedes registrar otra o ir al resumen y pago.');
    } catch (err) {
      const details = getValidationDetails(err);
      if (details) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) flat[k] = (v as string[])[0] ?? '';
        setFieldErrors(flat);
        toast.error('Revisa los campos marcados.');
      } else {
        clearAllErrors();
        toast.error(getErrorMessage(err));
      }
    }
  };

  const canContinueToPayment = contractLines.length >= 1;

  const handleAddLineFromExisting = () => {
    if (!draftPetId || !selectedPlanId) {
      toast.error('Selecciona un plan y una mascota');
      return;
    }
    if (petsWithOpenPlan.has(draftPetId)) {
      toast.error(
        'Esta mascota ya tiene un plan vigente. Cancélalo en Mi cuenta antes de contratar otro.',
      );
      return;
    }
    if (usedPetIds.has(draftPetId)) {
      toast.error('Esta mascota ya está en el contrato');
      return;
    }
    setContractLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), petId: draftPetId, planId: selectedPlanId },
    ]);
    setDraftPetId(null);
    toast.success('Línea agregada al contrato');
  };

  const handleRemoveLine = (lineId: string) => {
    setContractLines((prev) => prev.filter((l) => l.id !== lineId));
  };

  const clearDraftForAnotherLine = () => {
    setDraftPetId(null);
    toast.info('Elige otra mascota y el plan para esa mascota');
  };

  const selectMode = (mode: 'existing' | 'new') => {
    setContractMode(mode);
    clearAllErrors();
    setStep('pet');
    setContractLines([]);
    setDraftPetId(null);
  };

  const resetContractMode = () => {
    setContractMode('unset');
    setContractLines([]);
    setDraftPetId(null);
    setStep('pet');
    clearAllErrors();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-[#FFDCE6] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-lg">

            {/* Navbar */}
            <nav className="mb-8 md:mb-12">
              <div className="flex items-center justify-between">
                <Link to="/inicio" className="flex items-center">
                  <img src="/assets/logo woof.svg" alt="MishiWoof" className="h-12 md:h-14" />
                </Link>
                <div className="flex items-center gap-4 md:gap-6">
                  <Link to="/inicio" className="text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500">Home</Link>
                  <Link to="/sucursal-virtual" className="text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500">Mi cuenta</Link>
                  <Button asChild className="bg-[#FF6F61] text-white rounded-full px-4 md:px-6">
                    <Link to="/planes-y-coberturas">Ver planes</Link>
                  </Button>
                </div>
              </div>
            </nav>

            <div className="grid md:grid-cols-[2fr_1fr] gap-8 items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Contratación</h1>
                <p className="text-gray-600 text-sm mb-2">
                  Armas el contrato <strong className="text-gray-800 font-semibold">línea por línea</strong>
                  : cada vez eliges un plan y una mascota, la añades, y si quieres repites con otra combinación.
                  En el resumen ves cada mascota con su plan y el monto; al final haces{' '}
                  <strong className="text-gray-800 font-semibold">un solo pago</strong> por todo.
                </p>

                {/* ── Elegir tipo de contratación ───────────────────── */}
                {step === 'pet' && contractMode === 'unset' && (
                  <div className="space-y-5 mt-6">
                    <p className="text-sm font-semibold text-gray-800">¿Cómo quieres contratar?</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <ContractModeCard
                        title="Mascotas ya registradas"
                        description="Por cada mascota: eliges su plan, la añades al contrato, y puedes seguir con otra mascota u otro plan. Un solo cobro al final."
                        selected={false}
                        onClick={() => selectMode('existing')}
                        icon="🐾"
                      />
                      <ContractModeCard
                        title="Mascota nueva + plan"
                        description="Registra la mascota con el plan elegido y añádela al contrato. Puedes registrar otra después o ir al pago único."
                        selected={false}
                        onClick={() => selectMode('new')}
                        icon="✨"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Cada línea del contrato es independiente: distintas mascotas pueden tener distintos planes.
                    </p>
                  </div>
                )}

                {/* ── Step: pet (plan + mascota según modo) ─────────── */}
                {step === 'pet' && contractMode !== 'unset' && (
                  <div className="space-y-8 mt-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-[#FF6F61] font-medium">
                        {isExistingPetFlow ? 'Mascotas en tu cuenta' : 'Registro de mascota nueva'}
                      </p>
                      <button
                        type="button"
                        className="text-xs text-gray-500 hover:text-[#FF6F61] underline"
                        onClick={resetContractMode}
                      >
                        Cambiar tipo de contratación
                      </button>
                    </div>

                    {contractLines.length > 0 && (
                      <div className="rounded-xl border border-[#FF6F61]/30 bg-[#FF6F61]/5 p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">Líneas en tu contrato</p>
                          <p className="text-xs text-gray-600">
                            Total aprox.{' '}
                            <span className="font-semibold text-[#FF6F61]">
                              {totals.uf.toFixed(2)} UF
                            </span>{' '}
                            (~{totals.clpApprox.toLocaleString('es-CL')} CLP)
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {contractLines.map((line) => {
                            const pet = pets.find((p) => p.id === line.petId);
                            const plan = plans.find((p) => p.id === line.planId);
                            const lineClp = plan
                              ? Math.round(plan.basePriceUf * UF_CLP_APPROX)
                              : 0;
                            return (
                              <li
                                key={line.id}
                                className="flex flex-wrap items-center gap-2 justify-between rounded-lg bg-white/80 border border-gray-100 px-3 py-2 text-sm"
                              >
                                <span className="text-gray-800">
                                  <span className="font-medium">{pet?.name ?? 'Mascota'}</span>
                                  {' · '}
                                  <span className="text-gray-600">{plan?.name ?? 'Plan'}</span>
                                  {' · '}
                                  <span className="text-[#FF6F61] font-medium">
                                    {plan ? `${plan.basePriceUf} UF/mes` : '—'}
                                  </span>
                                  {plan ? (
                                    <span className="text-gray-500 text-xs">
                                      {' '}(~{lineClp.toLocaleString('es-CL')} CLP)
                                    </span>
                                  ) : null}
                                </span>
                                <button
                                  type="button"
                                  className="text-xs text-red-600 hover:underline shrink-0"
                                  onClick={() => handleRemoveLine(line.id)}
                                >
                                  Quitar
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        {contractLines.length > 0
                          ? 'Siguiente línea: elige el plan'
                          : 'Selecciona el plan'}
                      </p>
                      {selectedPlan && (
                        <p className="text-xs text-gray-500 mb-2">
                          Precio de esta línea: {selectedPlan.basePriceUf} UF/mes (~
                          {Math.round(selectedPlan.basePriceUf * UF_CLP_APPROX).toLocaleString('es-CL')} CLP)
                        </p>
                      )}
                      {plans.length === 0 ? (
                        <p className="text-sm text-gray-600">
                          No hay planes disponibles.{' '}
                          <Link to="/planes-y-coberturas" className="text-[#FF6F61] underline font-medium">
                            Ver planes
                          </Link>
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {plans.map((plan) => (
                            <PlanSelectCard
                              key={plan.id}
                              plan={plan}
                              selected={selectedPlanId === plan.id}
                              onClick={() => {
                                setSelectedPlanId(plan.id);
                                clearAllErrors();
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {isExistingPetFlow && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Elige una mascota para esta línea
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          Las mascotas ya añadidas al contrato no se pueden repetir. Luego pulsa «Añadir al
                          contrato».
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Cada mascota solo puede tener <strong className="text-gray-700">un plan a la vez</strong>
                          : si ya tiene suscripción activa o pendiente de pago, no podrás elegirla aquí hasta{' '}
                          <Link to="/sucursal-virtual" className="text-[#FF6F61] underline font-medium">
                            cancelarla en Mi cuenta
                          </Link>
                          .
                        </p>
                        {pets.length === 0 ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950 space-y-3">
                            <p>No tienes mascotas registradas. Para contratar con una mascota nueva, vuelve atrás y elige «Mascota nueva + plan».</p>
                            <Button type="button" variant="outline" size="sm" onClick={() => selectMode('new')}>
                              Ir a mascota nueva + plan
                            </Button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2.5">
                            {pets.map((pet) => {
                              const used = usedPetIds.has(pet.id);
                              const hasOpenPlan = petsWithOpenPlan.has(pet.id);
                              const blocked = subsLoading || used || hasOpenPlan;
                              let disabledReason: string | undefined;
                              if (hasOpenPlan) {
                                disabledReason =
                                  'Ya tiene un plan (activo o pendiente). Cancela la suscripción en Mi cuenta para contratar otro.';
                              } else if (used) {
                                disabledReason = 'Ya está en las líneas de este contrato.';
                              } else if (subsLoading) {
                                disabledReason = 'Cargando suscripciones…';
                              }
                              return (
                                <PetSelectCard
                                  key={pet.id}
                                  pet={pet}
                                  selected={draftPetId === pet.id}
                                  disabled={blocked}
                                  disabledReason={disabledReason}
                                  onClick={() => {
                                    if (blocked) return;
                                    setDraftPetId(pet.id);
                                    clearAllErrors();
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}
                        {pets.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <Button
                              type="button"
                              className="w-full bg-[#FF6F61] text-white"
                              onClick={handleAddLineFromExisting}
                              disabled={!draftPetId || !selectedPlanId}
                            >
                              Añadir al contrato
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={clearDraftForAnotherLine}
                              disabled={!draftPetId && contractLines.length === 0}
                            >
                              Agregar otra mascota / otro plan
                            </Button>
                            <p className="text-xs text-gray-500 text-center">
                              Limpia la mascota seleccionada y elige otra combinación con el plan que quieras
                              arriba.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {isNewPetFlow && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Datos de la nueva mascota (plan elegido arriba se aplica a esta línea)
                        </p>
                      </div>
                    )}

                    {/* Formulario solo en flujo mascota nueva */}
                    {isNewPetFlow && (
                      <form
                        onSubmit={handleCreatePet}
                        className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100"
                      >
                        <p className="text-sm font-semibold text-gray-800">Datos de la nueva mascota</p>

                        <div>
                          <Label>Nombre</Label>
                          <Input
                            value={petName}
                            onChange={(e) => { setPetName(e.target.value); clearFieldError('name'); }}
                            placeholder="Nombre de tu mascota"
                            className={cn('mt-1', fieldErrors.name && 'border-red-500')}
                            required
                          />
                          {fieldErrors.name && <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>}
                        </div>

                        <div>
                          <Label>Especie</Label>
                          <Select value={petSpecies} onValueChange={(v) => { setPetSpecies(v as 'DOG' | 'CAT'); clearFieldError('species'); }}>
                            <SelectTrigger className={cn('mt-1', fieldErrors.species && 'border-red-500')}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DOG">🐶 Perro</SelectItem>
                              <SelectItem value="CAT">🐱 Gato</SelectItem>
                            </SelectContent>
                          </Select>
                          {fieldErrors.species && <p className="text-xs text-red-600 mt-1">{fieldErrors.species}</p>}
                        </div>

                        <div>
                          <Label>Fecha de nacimiento</Label>
                          <Input
                            type="date"
                            value={petBirthDate}
                            onChange={(e) => { setPetBirthDate(e.target.value); clearFieldError('birth_date'); }}
                            className={cn('mt-1', fieldErrors.birth_date && 'border-red-500')}
                            required
                          />
                          {fieldErrors.birth_date && <p className="text-xs text-red-600 mt-1">{fieldErrors.birth_date}</p>}
                        </div>

                        <div className="space-y-2.5 border-t pt-4">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Información de salud</p>
                          {[
                            { id: 'sterilized', checked: isSterilized, setter: setIsSterilized, label: '¿Está esterilizada/o?' },
                            { id: 'disease', checked: hasDisease, setter: setHasDisease, label: '¿Tiene enfermedades preexistentes graves?' },
                            { id: 'minorDisease', checked: hasMinorDisease, setter: setHasMinorDisease, label: '¿Tiene enfermedades preexistentes menores?' },
                            { id: 'restricted', checked: isRestricted, setter: setIsRestricted, label: '¿Tiene restricciones especiales?' },
                          ].map(({ id, checked, setter, label }) => (
                            <div key={id} className="flex items-center gap-2">
                              <Checkbox id={id} checked={checked} onCheckedChange={(c) => setter(c === true)} />
                              <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">{label}</label>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 border-t pt-4">
                          <Checkbox id="tos" checked={acceptsTOS} onCheckedChange={(c) => setAcceptsTOS(c === true)} required />
                          <label htmlFor="tos" className="text-sm cursor-pointer">
                            Acepto los términos y condiciones <span className="text-red-500">*</span>
                          </label>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#FF6F61] text-white"
                          disabled={createPetMutation.isPending || !selectedPlanId}
                        >
                          {createPetMutation.isPending
                            ? 'Guardando...'
                            : !selectedPlanId
                              ? 'Selecciona un plan arriba'
                              : contractLines.length > 0
                                ? 'Registrar y agregar al contrato'
                                : 'Registrar mascota y agregar al contrato'}
                        </Button>
                        <p className="text-xs text-center text-gray-500">
                          Luego puedes registrar otra mascota o ir al{' '}
                          <strong className="font-medium text-gray-700">resumen y un solo pago</strong> por
                          todas las líneas.
                        </p>
                      </form>
                    )}

                    {canContinueToPayment && (
                      <Button
                        className="w-full bg-[#FF6F61] text-white"
                        onClick={() => { clearAllErrors(); setStep('subscription'); }}
                      >
                        Ir al resumen y pago (un solo cobro) →
                      </Button>
                    )}

                    {isExistingPetFlow &&
                      contractLines.length === 0 &&
                      pets.length > 0 &&
                      (!selectedPlanId || !draftPetId) && (
                      <p className="text-sm text-amber-700">
                        Elige plan y mascota, pulsa «Añadir al contrato», o añade varias líneas antes del pago.
                      </p>
                    )}
                  </div>
                )}

                {/* ── Step: subscription ─────────────────────────────── */}
                {step === 'subscription' && contractLines.length === 0 && (
                  <div className="space-y-4">
                    <p className="text-red-600 text-sm">No hay líneas en el contrato. Vuelve y añade al menos una mascota con plan.</p>
                    <Button variant="outline" type="button" onClick={() => setStep('pet')}>Volver</Button>
                  </div>
                )}

                {step === 'subscription' && contractLines.length > 0 && (
                  <div className="space-y-6">
                    <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      Revisa el detalle. Primero se crea la orden de pago en el sistema y luego se cobra con la
                      tarjeta (un solo débito por el total indicado).
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">Resumen antes de pagar</p>
                        <button
                          type="button"
                          className="text-xs text-[#FF6F61] hover:underline shrink-0"
                          onClick={() => setStep('pet')}
                        >
                          Editar contrato
                        </button>
                      </div>
                      <div className="rounded-xl border border-gray-200 overflow-hidden text-sm">
                        <div className="grid grid-cols-[1fr_auto_auto] gap-2 bg-gray-100 px-3 py-2 font-medium text-xs text-gray-600 uppercase tracking-wide">
                          <span>Mascota / plan</span>
                          <span className="text-right">UF/mes</span>
                          <span className="text-right">~CLP</span>
                        </div>
                        {contractLines.map((line) => {
                          const pet = pets.find((p) => p.id === line.petId);
                          const plan = plans.find((p) => p.id === line.planId);
                          const clp = plan ? Math.round(plan.basePriceUf * UF_CLP_APPROX) : 0;
                          return (
                            <div
                              key={line.id}
                              className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2.5 border-t border-gray-100 items-center"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate">{pet?.name ?? '—'}</p>
                                <p className="text-xs text-gray-500 truncate">{plan?.name ?? '—'}</p>
                              </div>
                              <span className="text-right text-[#FF6F61] font-medium tabular-nums">
                                {plan ? `${plan.basePriceUf}` : '—'}
                              </span>
                              <span className="text-right text-gray-600 tabular-nums text-xs">
                                {plan ? clp.toLocaleString('es-CL') : '—'}
                              </span>
                            </div>
                          );
                        })}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-3 border-t-2 border-gray-200 bg-[#FF6F61]/5 font-semibold text-gray-900">
                          <span>Total (referencia)</span>
                          <span className="text-right tabular-nums">{totals.uf.toFixed(2)} UF</span>
                          <span className="text-right tabular-nums text-sm">
                            ~{totals.clpApprox.toLocaleString('es-CL')}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Los montos en CLP son aproximados para orientarte; el importe definitivo lo confirma el
                        proveedor de pago y el backend.
                      </p>
                    </div>

                    {(fieldErrors.pet_id || fieldErrors.plan_id) && (
                      <p className="text-sm text-red-600">{fieldErrors.pet_id ?? fieldErrors.plan_id}</p>
                    )}

                    <div>
                      <Label>Cupón (opcional)</Label>
                      <Input
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); clearFieldError('coupon_code'); }}
                        placeholder="Código cupón"
                        className={cn('mt-1', fieldErrors.coupon_code && 'border-red-500')}
                      />
                      {fieldErrors.coupon_code && <p className="text-sm text-red-600 mt-1">{fieldErrors.coupon_code}</p>}
                    </div>

                    {paymentMethods.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-black">Forma de pago</p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button" size="sm"
                            variant={paymentMode === 'saved' ? 'default' : 'outline'}
                            className={paymentMode === 'saved' ? 'bg-[#FF6F61] text-white' : ''}
                            onClick={() => setPaymentMode('saved')}
                          >
                            Tarjeta guardada
                          </Button>
                          <Button
                            type="button" size="sm"
                            variant={paymentMode === 'new' ? 'default' : 'outline'}
                            className={paymentMode === 'new' ? 'bg-[#FF6F61] text-white' : ''}
                            onClick={() => setPaymentMode('new')}
                          >
                            Nueva tarjeta (Mercado Pago)
                          </Button>
                        </div>
                      </div>
                    )}

                    {paymentMethods.length === 0 && (
                      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        No tienes tarjeta guardada. Usa el formulario de Mercado Pago abajo o agrega una en{' '}
                        <Link to="/sucursal-virtual" className="text-[#FF6F61] underline font-medium">Mi cuenta</Link>.
                      </p>
                    )}

                    {paymentMethods.length > 0 && paymentMode === 'saved' && (
                      <SubscribeBatchForm
                        items={batchItems}
                        couponCode={couponCode.trim() || undefined}
                        paymentProvider="MERCADOPAGO"
                        onSuccess={() => { clearAllErrors(); setStep('done'); }}
                      />
                    )}

                    {(paymentMethods.length === 0 || paymentMode === 'new') && (
                      <div className="space-y-3 border-t pt-6">
                        <p className="text-sm font-medium text-black">Mercado Pago — datos de tarjeta</p>
                        <p className="text-xs text-muted-foreground">
                          Requiere HTTPS en local. Acepta el certificado del navegador si Vite usa uno autofirmado.
                        </p>
                        <PaymentForm
                          items={batchItems}
                          couponCode={couponCode.trim() || undefined}
                          paymentProvider="MERCADOPAGO"
                          brickAmount={Math.max(100, totals.clpApprox)}
                          onSuccess={() => { clearAllErrors(); setStep('done'); }}
                        />
                      </div>
                    )}

                    <Button variant="outline" className="w-full" type="button" onClick={() => setStep('pet')}>
                      Volver
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/sucursal-virtual">Ir a Mi cuenta</Link>
                    </Button>
                  </div>
                )}

                {/* ── Step: done ─────────────────────────────────────── */}
                {step === 'done' && (
                  <div className="space-y-4">
                    <p className="text-lg font-semibold text-green-700">
                      ¡Listo! Contratación y pago completados
                      {contractLines.length > 1
                        ? ` (${contractLines.length} líneas en tu contrato).`
                        : '.'}
                    </p>
                    <Button asChild className="w-full bg-[#FF6F61] text-white">
                      <Link to="/sucursal-virtual">Ir a Mi cuenta</Link>
                    </Button>
                  </div>
                )}
              </div>

              <aside className="lg:sticky lg:top-24 self-start w-full max-w-xl mx-auto lg:mx-0 lg:max-w-md space-y-3">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  {step === 'done'
                    ? 'Contratación'
                    : step === 'subscription' && uniqueContractPlanIds.length > 1
                      ? 'Planes en tu pago'
                      : 'Detalle del plan'}
                </p>

                {step === 'done' ? (
                  <div className="rounded-2xl border border-green-200/80 bg-green-50/70 p-5 text-sm text-green-900">
                    <p className="font-semibold">¡Gracias por contratar!</p>
                    <p className="text-xs mt-2 text-green-800/90 leading-relaxed">
                      En Mi cuenta podrás ver el estado de cada suscripción y tus métodos de pago.
                    </p>
                  </div>
                ) : step === 'pet' && contractMode === 'unset' ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-600 leading-relaxed">
                    Cuando elijas cómo quieres contratar y un plan, aquí verás las{' '}
                    <strong className="text-gray-800 font-medium">coberturas</strong>,{' '}
                    <strong className="text-gray-800 font-medium">topes por evento</strong> y{' '}
                    <strong className="text-gray-800 font-medium">eventos anuales</strong> según los datos del
                    plan.
                  </div>
                ) : step === 'subscription' && uniqueContractPlanIds.length > 0 ? (
                  <div className="space-y-4">
                    {uniqueContractPlanIds.length > 1 ? (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Tu pago incluye varios planes. Revisa la cobertura de cada uno antes de pagar.
                      </p>
                    ) : null}
                    {uniqueContractPlanIds.map((pid) => (
                      <PlanCoveragePanelFromId
                        key={pid}
                        planId={pid}
                        ufClpApprox={UF_CLP_APPROX}
                        subtitle="Incluido en este pago"
                      />
                    ))}
                  </div>
                ) : (
                  <PlanCoveragePanel
                    plan={selectedPlan}
                    isLoading={selectedPlanLoading}
                    ufClpApprox={UF_CLP_APPROX}
                  />
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#E0E8FF] px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link to="/inicio" className="flex items-center">
            <img src="/assets/logo woof.svg" alt="MishiWoof" className="h-8 md:h-12" style={{ filter: 'grayscale(100%)' }} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
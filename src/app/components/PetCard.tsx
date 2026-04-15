/**
 * PetCard Component
 *
 * Horizontal pet card for SucursalVirtualPage.
 * Shows: photo/avatar, name + age, species + breed, active plan.
 *
 * Props mirror the Pet domain object. `subscription` is optional —
 * pass it when you can correlate a pet to an active subscription/plan.
 */

import { cn } from '@shared/utils/cn';

/**
 * PetCard Component — compact vertical card for grid layout
 */

interface PetCardProps {
  pet: {
    id: string;
    name: string;
    species?: string;
    breed?: string;
    age?: number;
    photoUrl?: string | null;
  };
  planName?: string | null;
  planStatus?: string | null;
  className?: string;
}

const SPECIES_EMOJI: Record<string, string> = {
  perro: '🐶', gato: '🐱', dog: '🐶', cat: '🐱',
};

function speciesEmoji(species?: string) {
  if (!species) return '🐾';
  return SPECIES_EMOJI[species.toLowerCase()] ?? '🐾';
}

function planBadgeStyle(status?: string | null) {
  switch ((status ?? '').toUpperCase()) {
    case 'ACTIVE':    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PAST_DUE':  return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-200';
    default:          return 'bg-gray-100 text-gray-400 border-gray-200';
  }
}

function planStatusLabel(status?: string | null) {
  switch ((status ?? '').toUpperCase()) {
    case 'ACTIVE':    return 'Activo';
    case 'PAST_DUE':  return 'Pendiente';
    case 'CANCELLED': return 'Cancelado';
    default:          return status ?? '';
  }
}

export function PetCard({ pet, planName, planStatus, className }: PetCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden',
        'transition-all duration-200 hover:shadow-md hover:border-[#FF6F61]/30 hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Photo */}
      <div className="relative bg-[#FFDCE6]/30 flex items-center justify-center h-28">
        {pet.photoUrl ? (
          <img
            src={pet.photoUrl}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl select-none">{speciesEmoji(pet.species)}</span>
        )}

        {/* Status dot */}
        {planName && (
          <span
            className={cn(
              'absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white',
              (planStatus ?? '').toUpperCase() === 'ACTIVE'    && 'bg-emerald-400',
              (planStatus ?? '').toUpperCase() === 'PAST_DUE'  && 'bg-amber-400',
              (planStatus ?? '').toUpperCase() === 'CANCELLED' && 'bg-red-400',
              !planStatus && 'bg-gray-300',
            )}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 px-3 py-3">
        <div className="flex items-baseline justify-between gap-1">
          <p className="font-semibold text-gray-900 text-sm truncate">{pet.name}</p>
          {pet.age != null && (
            <span className="text-xs text-gray-400 shrink-0">{pet.age}a</span>
          )}
        </div>

        {(pet.species || pet.breed) && (
          <p className="text-xs text-gray-400 capitalize truncate">
            {[pet.species, pet.breed].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="mt-1">
          {planName ? (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
                planBadgeStyle(planStatus),
              )}
            >
              <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" />
              </svg>
              {planName}
              {planStatus && ` · ${planStatusLabel(planStatus)}`}
            </span>
          ) : (
            <span className="text-xs text-gray-300 italic">Sin plan</span>
          )}
        </div>
      </div>
    </div>
  );
}
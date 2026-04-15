/**
 * Alta POST /billing/subscriptions: 403 mascota ajena; 409 suscripción abierta → no repetir alta, pagar con id existente.
 */

import { isApiError, type ApiError } from '@shared/infrastructure/http/api.error';
import type { SubscriptionBatchResponse, SubscriptionResponse } from './dto/BillingDTO';

function unwrapPayload(data: unknown): unknown {
  if (
    data &&
    typeof data === 'object' &&
    'success' in data &&
    (data as { success?: boolean }).success === true &&
    'data' in data
  ) {
    return (data as { data: unknown }).data;
  }
  return data;
}

function payloadFromApiError(error: ApiError): unknown {
  const fromAxios = error.originalError?.response?.data;
  return unwrapPayload(fromAxios ?? error.errorData);
}

function pickRootId(payload: Record<string, unknown>): string | null {
  const id = payload.id ?? payload.batch_id ?? payload.batchId;
  if (typeof id === 'string' && id.trim()) return id.trim();
  return null;
}

/**
 * Tras 409 en creación por **lote** (`items`): devuelve el `id` del batch para POST .../subscriptions/batch/:id/pay.
 */
export function extractExistingBatchIdFrom409(error: unknown): string | null {
  if (!isApiError(error) || error.statusCode !== 409) return null;
  const raw = payloadFromApiError(error);
  if (!raw || typeof raw !== 'object') return null;
  return pickRootId(raw as Record<string, unknown>);
}

/** Cuerpo 409 con misma forma que un alta exitosa → reutilizar para el paso de pago (sin crear de nuevo). */
export function extractExistingBatchResponseFrom409(error: unknown): SubscriptionBatchResponse | null {
  const id = extractExistingBatchIdFrom409(error);
  if (!id || !isApiError(error)) return null;
  const raw = payloadFromApiError(error);
  if (!raw || typeof raw !== 'object') return { id, subscriptionIds: [] };
  const p = raw as Record<string, unknown>;
  let subscriptionIds: string[] = [];
  if (Array.isArray(p.subscriptionIds)) {
    subscriptionIds = (p.subscriptionIds as unknown[]).filter((x): x is string => typeof x === 'string');
  } else if (Array.isArray(p.subscription_ids)) {
    subscriptionIds = (p.subscription_ids as unknown[]).filter((x): x is string => typeof x === 'string');
  } else if (Array.isArray(p.subscriptions)) {
    subscriptionIds = (p.subscriptions as { id?: string }[])
      .map((s) => s.id)
      .filter((x): x is string => typeof x === 'string');
  }
  const subscriptions = Array.isArray(p.subscriptions)
    ? (p.subscriptions as SubscriptionResponse[])
    : undefined;
  return { id, subscriptionIds, subscriptions };
}

/**
 * Tras 409 en creación **unitaria** (petId + planId): id de suscripción para POST .../subscriptions/:id/pay.
 */
export function extractExistingSubscriptionIdFrom409(error: unknown): string | null {
  if (!isApiError(error) || error.statusCode !== 409) return null;
  const raw = payloadFromApiError(error);
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;
  const direct = pickRootId(p);
  if (direct) return direct;
  const subs = p.subscriptions;
  if (Array.isArray(subs) && subs[0] && typeof subs[0] === 'object' && subs[0] !== null) {
    const sid = (subs[0] as { id?: string }).id;
    if (typeof sid === 'string' && sid.trim()) return sid.trim();
  }
  return null;
}

/** Suscripción cancelada → la mascota puede volver a contratar otro plan. */
export function isCanceledSubscriptionStatus(status: string): boolean {
  const u = String(status).toUpperCase();
  return u === 'CANCELED' || u === 'CANCELLED';
}

/**
 * `petId` con al menos una suscripción que no esté cancelada (ACTIVE, PENDING, etc.)
 * → no debe ofrecerse otro contrato hasta cancelar la actual.
 */
export function getPetIdsWithOpenSubscription(
  subscriptions: { petId: string; status: string }[],
): Set<string> {
  const set = new Set<string>();
  for (const s of subscriptions) {
    if (s.petId && !isCanceledSubscriptionStatus(s.status)) {
      set.add(s.petId);
    }
  }
  return set;
}

/** Mensajes claros para alta de suscripción (403 / 409). */
export function getSubscriptionCreateErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return error instanceof Error ? error.message : 'Ocurrió un error inesperado';
  }
  if (error.statusCode === 403) {
    const m = error.message?.trim();
    if (m && m.length > 0 && m !== 'Unknown error') return m;
    return 'No puedes contratar esa mascota: no pertenece a tu cuenta en esta sesión.';
  }
  if (error.statusCode === 409) {
    const m = error.message?.trim();
    if (m && m.length > 0 && m !== 'Unknown error') return m;
    return 'Ya hay una suscripción abierta (no cancelada) para esta combinación. No repitas el alta: completa el pago pendiente.';
  }
  return error.getUserMessage();
}

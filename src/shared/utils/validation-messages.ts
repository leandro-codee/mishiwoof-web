/**
 * Traduce mensajes de validación del backend (inglés) al español.
 * Compatible con mensajes de go-playground/validator (formatValidationMessage).
 */

const FIELD_LABELS: Record<string, string> = {
  name: 'Nombre',
  names: 'Nombres',
  pet_name: 'Nombre de la mascota',
  species: 'Especie',
  birth_date: 'Fecha de nacimiento',
  email: 'Correo electrónico',
  password: 'Contraseña',
  pet_id: 'Mascota',
  plan_id: 'Plan',
  coupon_code: 'Código de cupón',
  subscription_id: 'Suscripción',
  payment_method_id: 'Método de pago',
  idempotency_key: 'Clave de idempotencia',
  vet_name: 'Nombre del veterinario',
  vet_clinic: 'Clínica',
  attention_date: 'Fecha de atención',
  diagnosis: 'Diagnóstico',
  treatment_description: 'Descripción del tratamiento',
  card_number: 'Número de tarjeta',
  card_holder: 'Titular',
  expiry_month: 'Mes de vencimiento',
  expiry_year: 'Año de vencimiento',
  cvc: 'CVC',
};

/**
 * Traduce un mensaje de validación al español.
 * @param message Mensaje en inglés del backend (ej: "name is required")
 * @param fieldKey Clave del campo en snake_case (ej: "birth_date") para usar etiqueta amigable
 */
export function translateValidationMessage(message: string, fieldKey?: string): string {
  if (!message || typeof message !== 'string') return message;

  const lower = message.toLowerCase();
  const label = (fieldKey && FIELD_LABELS[fieldKey]) || fieldKey || 'Campo';

  // required
  if (lower.includes('is required') || lower.includes('required')) {
    return `${label} es obligatorio`;
  }

  // email
  if (lower.includes('valid email') || lower.includes('email')) {
    return `${label} debe ser un correo electrónico válido`;
  }

  // min length
  const minMatch = message.match(/must be at least (\d+) characters?/i);
  if (minMatch) {
    return `${label} debe tener al menos ${minMatch[1]} caracteres`;
  }

  // max length
  const maxMatch = message.match(/must be at most (\d+) characters?/i);
  if (maxMatch) {
    return `${label} debe tener como máximo ${maxMatch[1]} caracteres`;
  }

  // oneof
  const oneofMatch = message.match(/must be one of: (.+)/i);
  if (oneofMatch) {
    return `${label} debe ser uno de: ${oneofMatch[1]}`;
  }

  // gte / lte (numbers)
  if (lower.includes('greater than or equal')) {
    const param = message.match(/to (\S+)/)?.[1] ?? '';
    return `${label} debe ser mayor o igual a ${param}`;
  }
  if (lower.includes('less than or equal')) {
    const param = message.match(/to (\S+)/)?.[1] ?? '';
    return `${label} debe ser menor o igual a ${param}`;
  }

  // url
  if (lower.includes('valid url')) {
    return `${label} debe ser una URL válida`;
  }

  // invalid (genérico)
  if (lower.includes('is invalid')) {
    return `${label} no es válido`;
  }

  // Si no coincide con ningún patrón, intentar reemplazar el nombre del campo por la etiqueta
  for (const [key, friendlyLabel] of Object.entries(FIELD_LABELS)) {
    const snake = key;
    const re = new RegExp(`\\b${snake}\\b`, 'gi');
    if (re.test(message)) {
      return message.replace(re, friendlyLabel);
    }
  }

  return message;
}

/**
 * Convierte un objeto de errores de validación (campo -> mensajes) traduciendo cada mensaje al español.
 */
export function translateValidationDetails(
  details: Record<string, string[]> | Record<string, string>
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(details)) {
    const messages = Array.isArray(value) ? value : [String(value)];
    out[key] = messages.map((msg) => translateValidationMessage(msg, key));
  }
  return out;
}

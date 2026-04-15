/**
 * PaymentMethodsSection - Listar, agregar, establecer primaria y eliminar métodos de pago
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  usePaymentMethods,
  useTokenizePaymentMethod,
  useSetPrimaryPaymentMethod,
  useDeletePaymentMethod,
} from '@modules/billing/presentation/hooks/useBilling';
import { useMercadoPago } from '@modules/billing/presentation/hooks/useMercadoPago';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function PaymentMethodsSection() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const tokenizeMutation = useTokenizePaymentMethod();
  const setPrimaryMutation = useSetPrimaryPaymentMethod();
  const deleteMutation = useDeletePaymentMethod();
  const [open, setOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const { ready: mpReady, getCardToken, publicKeyConfigured } = useMercadoPago();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const month = parseInt(expMonth, 10);
    const year = parseInt(expYear, 10);
    if (
      !cardNumber.trim() ||
      !month ||
      !year ||
      !cvv.trim() ||
      !cardholderName.trim() ||
      !payerEmail.trim()
    ) {
      toast.error('Completa todos los campos (incluido el email del pagador)');
      return;
    }
    if (!publicKeyConfigured || !mpReady) {
      toast.error('Mercado Pago no está listo. Revisa VITE_MP_PUBLIC_KEY.');
      return;
    }
    if (month < 1 || month > 12) {
      toast.error('Mes inválido (1-12)');
      return;
    }
    try {
      const cardToken = await getCardToken({
        cardNumber: cardNumber.replace(/\s/g, ''),
        expirationMonth: String(month).padStart(2, '0'),
        expirationYear: String(year),
        securityCode: cvv.trim(),
        cardholderName: cardholderName.trim(),
      });
      await tokenizeMutation.mutateAsync({
        cardToken,
        cardholderName: cardholderName.trim(),
        payerEmail: payerEmail.trim(),
        isPrimary: isPrimary,
        isBackup: false,
      });
      toast.success('Tarjeta agregada correctamente');
      setOpen(false);
      setCardNumber('');
      setExpMonth('');
      setExpYear('');
      setCvv('');
      setCardholderName('');
      setPayerEmail('');
      setFieldErrors({});
    } catch (err) {
        console.error('Error raw:', err)
        console.error('Error JSON:', JSON.stringify(err, null, 2))
      const details = getValidationDetails(err);
      if (details) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) {
          const msg = (v as string[])[0] ?? '';
          const key = k === 'card_number' ? 'cardNumber' : k === 'exp_month' ? 'expMonth' : k === 'exp_year' ? 'expYear' : k === 'cardholder_name' ? 'cardholderName' : k;
          flat[key] = msg;
        }
        setFieldErrors(flat);
        toast.error('Revisa los campos marcados.');
      } else {
        setFieldErrors({});
        toast.error(getErrorMessage(err));
      }
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryMutation.mutateAsync(id);
      toast.success('Método de pago establecido como principal');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este método de pago?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Método de pago eliminado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="bg-gray-100 rounded-xl p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-black">Métodos de pago</h2>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setFieldErrors({}); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white">
              Agregar tarjeta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva tarjeta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCard} className="space-y-4 mt-4">
              <div>
                <Label>Número de tarjeta</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => { setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19)); clearFieldError('cardNumber'); }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className={fieldErrors.cardNumber ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.cardNumber && <p className="text-sm text-red-600 mt-1">{fieldErrors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mes (MM)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    value={expMonth}
                    onChange={(e) => { setExpMonth(e.target.value); clearFieldError('expMonth'); }}
                    placeholder="12"
                    className={fieldErrors.expMonth ? 'border-red-500' : ''}
                    required
                  />
                  {fieldErrors.expMonth && <p className="text-sm text-red-600 mt-1">{fieldErrors.expMonth}</p>}
                </div>
                <div>
                  <Label>Año (AAAA)</Label>
                  <Input
                    type="number"
                    min={new Date().getFullYear()}
                    value={expYear}
                    onChange={(e) => { setExpYear(e.target.value); clearFieldError('expYear'); }}
                    placeholder="2028"
                    className={fieldErrors.expYear ? 'border-red-500' : ''}
                    required
                  />
                  {fieldErrors.expYear && <p className="text-sm text-red-600 mt-1">{fieldErrors.expYear}</p>}
                </div>
              </div>
              <div>
                <Label>CVV</Label>
                <Input
                  type="password"
                  value={cvv}
                  onChange={(e) => { setCvv(e.target.value.replace(/\D/g, '').slice(0, 4)); clearFieldError('cvv'); }}
                  placeholder="123"
                  maxLength={4}
                  className={fieldErrors.cvv ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.cvv && <p className="text-sm text-red-600 mt-1">{fieldErrors.cvv}</p>}
              </div>
              <div>
                <Label>Titular</Label>
                <Input
                  value={cardholderName}
                  onChange={(e) => { setCardholderName(e.target.value); clearFieldError('cardholderName'); }}
                  placeholder="Nombre como en la tarjeta"
                  className={fieldErrors.cardholderName ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.cardholderName && <p className="text-sm text-red-600 mt-1">{fieldErrors.cardholderName}</p>}
              </div>
              <div>
                <Label>Email del pagador</Label>
                <Input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => { setPayerEmail(e.target.value); clearFieldError('payerEmail'); }}
                  placeholder="correo@testuser.com"
                  className={fieldErrors.payerEmail ? 'border-red-500' : ''}
                  required
                />
                {fieldErrors.payerEmail && <p className="text-sm text-red-600 mt-1">{fieldErrors.payerEmail}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                />
                <Label htmlFor="primary">Usar como método principal</Label>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#FF6F61] text-white"
                disabled={tokenizeMutation.isPending || !mpReady}
              >
                {tokenizeMutation.isPending ? 'Guardando...' : 'Agregar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-lg" />
      ) : methods.length === 0 ? (
        <p className="text-gray-600">No tienes métodos de pago. Agrega una tarjeta para pagar suscripciones.</p>
      ) : (
        <ul className="space-y-2">
          {methods.map((pm) => (
            <li
              key={pm.id}
              className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {pm.cardBrand ?? 'Tarjeta'} ****{pm.last4 ?? '****'}
                </span>
                {pm.isPrimary && (
                  <span className="text-xs bg-[#FF6F61]/20 text-[#FF6F61] px-2 py-0.5 rounded">Principal</span>
                )}
              </div>
              <div className="flex gap-2">
                {!pm.isPrimary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(pm.id)}
                    disabled={setPrimaryMutation.isPending}
                  >
                    Principal
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200"
                  onClick={() => handleDelete(pm.id)}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

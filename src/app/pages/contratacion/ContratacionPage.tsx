/**
 * ContratacionPage - Flujo: plan → mascota → suscripción → pago
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlansList, usePlan } from '@modules/plans/presentation/hooks/usePlans';
import { usePetsList, useCreatePet } from '@modules/pets/presentation/hooks/usePets';
import { useCreateSubscription, useProcessPayment, usePaymentMethods } from '@modules/billing/presentation/hooks/useBilling';
import { useValidateCoupon } from '@modules/coupons/presentation/hooks/useCoupons';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';

export function ContratacionPage() {
  const location = useLocation();
  const planIdFromState = (location.state as { planId?: string } | null)?.planId;

  const { data: plans = [] } = usePlansList();
  const planId = planIdFromState ?? plans[0]?.id;
  const { data: selectedPlan } = usePlan(planId ?? null);
  const { data: pets = [] } = usePetsList();
  const createPetMutation = useCreatePet();
  const createSubMutation = useCreateSubscription();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const validateCouponMutation = useValidateCoupon();

  const [petId, setPetId] = useState<string>(() => pets[0]?.id ?? '');
  const [createNewPet, setCreateNewPet] = useState(pets.length === 0);
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState<'DOG' | 'CAT'>('DOG');
  const [petBirthDate, setPetBirthDate] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [step, setStep] = useState<'pet' | 'subscription' | 'payment' | 'done'>('pet');

  const processPaymentMutation = useProcessPayment(subscriptionId ?? '');

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !petBirthDate) {
      toast.error('Nombre y fecha de nacimiento son obligatorios');
      return;
    }
    try {
      const pet = await createPetMutation.mutateAsync({
        name: petName.trim(),
        species: petSpecies,
        birth_date: petBirthDate,
        is_sterilized: false,
        disease: false,
        restricted: false,
        minor_disease: false,
        tos: false,
      });
      setPetId(pet.id);
      setCreateNewPet(false);
      setStep('subscription');
      toast.success('Mascota registrada');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCreateSubscription = async () => {
    const effectivePetId = petId || (pets[0]?.id);
    if (!effectivePetId || !planId) {
      toast.error('Selecciona una mascota y un plan');
      return;
    }
    try {
      const payload: { pet_id: string; plan_id: string; coupon_code?: string } = {
        pet_id: effectivePetId,
        plan_id: planId,
      };
      if (couponCode.trim()) {
        const validation = await validateCouponMutation.mutateAsync({
          code: couponCode.trim(),
          plan_id: planId,
          price_uf: selectedPlan?.base_price_uf ?? 0,
        });
        if (validation.valid) payload.coupon_code = couponCode.trim();
      }
      const sub = await createSubMutation.mutateAsync(payload);
      setSubscriptionId(sub.id);
      setStep('payment');
      toast.success('Suscripción creada. Agrega método de pago o paga ahora.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleProcessPayment = async () => {
    if (!subscriptionId) return;
    const primary = paymentMethods.find((pm) => pm.is_primary) ?? paymentMethods[0];
    if (!primary) {
      toast.error('Agrega un método de pago en Mi cuenta primero');
      return;
    }
    try {
      await processPaymentMutation.mutateAsync({
        payment_method_id: primary.id,
        idempotency_key: `pay-${subscriptionId}-${Date.now()}`,
      });
      setStep('done');
      toast.success('Pago procesado correctamente');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const effectivePetId = petId || (createNewPet ? undefined : pets[0]?.id);
  const canGoSubscription = effectivePetId && planId;

  return (
    <div className="min-h-screen flex flex-col">
      <section className="bg-[#FFDCE6] px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl p-6 md:p-12 shadow-lg">
            <nav className="mb-8 md:mb-12">
              <div className="flex items-center justify-between">
                <Link to="/home" className="flex items-center">
                  <img src="/assets/logo woof.svg" alt="MishiWoof" className="h-12 md:h-14" />
                </Link>
                <div className="flex items-center gap-4 md:gap-6">
                  <Link to="/home" className="text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500">Home</Link>
                  <Link to="/sucursal-virtual" className="text-sm md:text-base rounded-full px-4 md:px-6 py-2 border-2 border-transparent hover:border-violet-500">Mi cuenta</Link>
                  <Button asChild className="bg-[#FF6F61] text-white rounded-full px-4 md:px-6">
                    <Link to="/planes-y-coberturas">Ver planes</Link>
                  </Button>
                </div>
              </div>
            </nav>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Contratación</h1>
                <h2 className="text-2xl font-bold text-[#FF6F61] mb-6">{selectedPlan?.name ?? 'Plan'}</h2>
                {selectedPlan && (
                  <p className="text-gray-600 mb-6">{selectedPlan.base_price_uf} UF/mes · {selectedPlan.description ?? ''}</p>
                )}

                {step === 'pet' && (
                  <div className="space-y-6">
                    <div>
                      <Label>Mascota</Label>
                      <div className="flex gap-2 mt-2">
                        <Button type="button" variant={!createNewPet ? 'default' : 'outline'} onClick={() => { setCreateNewPet(false); setPetId(pets[0]?.id ?? ''); }}>
                          Usar existente
                        </Button>
                        <Button type="button" variant={createNewPet ? 'default' : 'outline'} onClick={() => setCreateNewPet(true)}>
                          Nueva mascota
                        </Button>
                      </div>
                      {!createNewPet && pets.length > 0 && (
                        <Select value={petId || pets[0].id} onValueChange={setPetId}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Selecciona mascota" />
                          </SelectTrigger>
                          <SelectContent>
                            {pets.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name} ({p.species})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {createNewPet && (
                        <form onSubmit={handleCreatePet} className="mt-4 space-y-4">
                          <div>
                            <Label>Nombre mascota</Label>
                            <Input value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Nombre" required />
                          </div>
                          <div>
                            <Label>Especie</Label>
                            <Select value={petSpecies} onValueChange={(v) => setPetSpecies(v as 'DOG' | 'CAT')}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DOG">Perro</SelectItem>
                                <SelectItem value="CAT">Gato</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Fecha de nacimiento</Label>
                            <Input type="date" value={petBirthDate} onChange={(e) => setPetBirthDate(e.target.value)} required />
                          </div>
                          <Button type="submit" className="bg-[#FF6F61] text-white" disabled={createPetMutation.isPending}>
                            {createPetMutation.isPending ? 'Guardando...' : 'Registrar mascota'}
                          </Button>
                        </form>
                      )}
                    </div>
                    {canGoSubscription && (
                      <Button className="w-full bg-[#FF6F61] text-white" onClick={() => setStep('subscription')}>
                        Continuar a suscripción
                      </Button>
                    )}
                  </div>
                )}

                {step === 'subscription' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Mascota y plan listos. Opcional: cupón de descuento.</p>
                    <div>
                      <Label>Cupón (opcional)</Label>
                      <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Código cupón" className="mt-1" />
                    </div>
                    <Button className="w-full bg-[#FF6F61] text-white" onClick={handleCreateSubscription} disabled={createSubMutation.isPending}>
                      {createSubMutation.isPending ? 'Creando suscripción...' : 'Crear suscripción'}
                    </Button>
                  </div>
                )}

                {step === 'payment' && (
                  <div className="space-y-6">
                    <p className="text-gray-600">Suscripción creada. Puedes pagar ahora con tu método de pago principal o agregar uno en Mi cuenta.</p>
                    {paymentMethods.length === 0 ? (
                      <p className="text-sm text-amber-700">No tienes métodos de pago. Ve a Mi cuenta para agregar una tarjeta y luego vuelve a intentar el pago.</p>
                    ) : (
                      <Button className="w-full bg-[#FF6F61] text-white" onClick={handleProcessPayment} disabled={processPaymentMutation.isPending}>
                        {processPaymentMutation.isPending ? 'Procesando...' : 'Pagar ahora'}
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/sucursal-virtual">Ir a Mi cuenta</Link>
                    </Button>
                  </div>
                )}

                {step === 'done' && (
                  <div className="space-y-4">
                    <p className="text-lg font-semibold text-green-700">¡Listo! Contratación y pago completados.</p>
                    <Button asChild className="w-full bg-[#FF6F61] text-white">
                      <Link to="/sucursal-virtual">Ir a Mi cuenta</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-center md:justify-end">
                <img src="/assets/path1 img.svg" alt="Mascotas" className="w-full max-w-md h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#E0E8FF] px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link to="/home" className="flex items-center">
            <img src="/assets/logo woof.svg" alt="MishiWoof" className="h-8 md:h-12" style={{ filter: 'grayscale(100%)' }} />
          </Link>
        </div>
      </footer>
    </div>
  );
}

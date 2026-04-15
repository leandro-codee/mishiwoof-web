import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    MercadoPago: new (publicKey: string) => MercadoPagoInstance;
  }
}

/** Respuesta típica del Card Payment Brick al enviar (token en contexto de la public key del vendedor). */
export type CardPaymentBrickFormData = {
  token?: string;
  cardholderName?: string;
  payer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    identification?: { type?: string; number?: string };
  };
};

type CardPaymentBrickController = { unmount: () => void };

type CardTokenPayload = {
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  cardholderName: string;
};

type MpFieldController = {
  mount: (containerId: string) => void | Promise<void>;
  unmount?: () => void;
};

type MpFieldsApi = {
  create: (field: string, options?: Record<string, unknown>) => MpFieldController;
  createCardToken: (opts: { cardId: string }) => Promise<{ id: string }>;
};

type MercadoPagoInstance = {
  bricks: () => {
    create: (
      type: 'cardPayment',
      containerId: string,
      settings: Record<string, unknown>,
    ) => Promise<CardPaymentBrickController>;
  };
  fields?: MpFieldsApi;
  /** Core API (Checkout API): puede estar disponible según versión del script MP. */
  createCardToken?: (data: Record<string, string>) => Promise<{ id: string }>;
};

const MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';
const PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY as string | undefined;

export type MountCardPaymentBrickOptions = {
  amount: number;
  onSubmit: (formData: CardPaymentBrickFormData) => Promise<void>;
  onReady?: () => void;
  onError?: (error: unknown) => void;
};

export function useMercadoPago() {
  const [mp, setMp] = useState<MercadoPagoInstance | null>(null);
  const [ready, setReady] = useState(false);
  const scriptAppendedRef = useRef(false);

  useEffect(() => {
    if (!PUBLIC_KEY?.trim()) {
      return;
    }

    if (window.MercadoPago) {
      setMp(new window.MercadoPago(PUBLIC_KEY));
      setReady(true);
      return;
    }

    if (scriptAppendedRef.current) {
      return;
    }
    scriptAppendedRef.current = true;

    const script = document.createElement('script');
    script.src = MP_SDK_URL;
    script.async = true;
    script.onload = () => {
      setMp(new window.MercadoPago(PUBLIC_KEY));
      setReady(true);
    };
    document.body.appendChild(script);

    return () => {
      scriptAppendedRef.current = false;
    };
  }, []);

  const getCardToken = useCallback(
    async (cardData: CardTokenPayload) => {
      if (!mp) {
        throw new Error('MercadoPago SDK not ready');
      }
      const create = mp.createCardToken;
      if (typeof create !== 'function') {
        throw new Error(
          'createCardToken no está disponible en esta versión del SDK; usa el Card Payment Brick (PaymentForm).',
        );
      }
      const token = await create.call(mp, {
        cardNumber: cardData.cardNumber,
        cardExpirationMonth: cardData.expirationMonth,
        cardExpirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
        cardholderName: cardData.cardholderName,
      });
      return token.id;
    },
    [mp],
  );

  /**
   * Monta el campo seguro de CVV (iframe). Debe existir un elemento con `containerId` como id.
   * Desmontar con la función devuelta al salir del paso o al desmontar el componente.
   */
  const mountCvvField = useCallback(
    (containerId: string) => {
      if (!mp) {
        throw new Error('MercadoPago SDK not ready');
      }
      const fields = mp.fields;
      if (!fields?.create) {
        throw new Error('Mercado Pago fields API no disponible (¿SDK v2 cargado?)');
      }
      const field = fields.create('securityCode', { placeholder: 'CVV' });
      void field.mount(containerId);
      return () => {
        try {
          field.unmount?.();
        } catch {
          /* noop */
        }
      };
    },
    [mp],
  );

  /**
   * Token con tarjeta ya guardada en MP: requiere CVV montado con mountCvvField y `cardId` del customer.
   */
  const createTokenFromCardId = useCallback(
    async (cardId: string) => {
      if (!mp) {
        throw new Error('MercadoPago SDK not ready');
      }
      const fields = mp.fields;
      if (!fields?.createCardToken) {
        throw new Error('Mercado Pago fields.createCardToken no disponible');
      }
      const token = await fields.createCardToken({ cardId });
      if (!token?.id) {
        throw new Error('No se obtuvo token de tarjeta');
      }
      return token.id;
    },
    [mp],
  );

  const mountCardPaymentBrick = useCallback(
    async (containerId: string, options: MountCardPaymentBrickOptions) => {
      if (!mp) {
        throw new Error('MercadoPago SDK not ready');
      }
      const bricksBuilder = mp.bricks();
      const controller = await bricksBuilder.create('cardPayment', containerId, {
        initialization: {
          amount: options.amount,
        },
        callbacks: {
          onReady: options.onReady,
          onError: options.onError,
          onSubmit: (formData: CardPaymentBrickFormData) => options.onSubmit(formData),
        },
      });
      return () => {
        try {
          controller.unmount();
        } catch {
          /* brick ya desmontado */
        }
      };
    },
    [mp],
  );

  return {
    mp,
    ready,
    getCardToken,
    mountCvvField,
    createTokenFromCardId,
    mountCardPaymentBrick,
    publicKeyConfigured: Boolean(PUBLIC_KEY?.trim()),
  };
}

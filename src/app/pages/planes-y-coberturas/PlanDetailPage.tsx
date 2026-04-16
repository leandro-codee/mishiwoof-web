/**
 * PlanDetailPage — pública, /planes/:planId
 *
 * Aggregada en un solo request a GET /plans/:id/detail:
 *  - hero (imagen, tier, nombre, precio UF/CLP, PDF)
 *  - coberturas (tipo + categoría)
 *  - tope anual + CTA configurable
 *  - compartir en redes sociales
 */

import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlanDetail } from '@modules/plans/presentation/hooks/usePlans';
import type { PlanDetailResponse } from '@modules/plans/application/dto/PlanDTO';
import { Facebook, Instagram, Star, Twitter, FileText, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPlanPDFDownloadURL } from '@modules/assets/infrastructure/repositories/http/AssetsHttpRepository';

const TIER_STARS: Record<string, number> = {
  bronze: 1,
  silver: 2,
  platinum: 2,
  gold: 3,
};

function starsForTier(tier: string | null | undefined): number {
  if (!tier) return 1;
  return TIER_STARS[tier.toLowerCase()] ?? 1;
}

function formatUF(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading, error } = usePlanDetail(planId);

  // SEO: set document title and og:image based on plan
  useEffect(() => {
    if (!data) return;
    const prevTitle = document.title;
    document.title = `Plan ${data.plan.name} — Mishiwoof`;
    const ogImage = upsertMetaTag('property', 'og:image');
    const ogTitle = upsertMetaTag('property', 'og:title');
    const ogDesc = upsertMetaTag('property', 'og:description');
    ogImage.content = data.plan.hero_image_url ?? data.plan.image_url ?? '';
    ogTitle.content = `Plan ${data.plan.name} — Mishiwoof`;
    ogDesc.content = `${data.plan.name}: ${formatUF(data.plan.price_uf)} UF/mes. Mira coberturas, topes y contrata en línea.`;
    return () => {
      document.title = prevTitle;
    };
  }, [data]);

  if (isLoading) return <PlanDetailSkeleton />;

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopNavbar pathname={location.pathname} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Plan no encontrado</h1>
          <p className="max-w-md text-gray-600">
            No pudimos encontrar el plan que buscas. Puede que haya sido despublicado o que el enlace
            esté incorrecto.
          </p>
          <Button onClick={() => navigate('/planes')} className="bg-[#FF6F61] text-white">
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  return <PlanDetailContent data={data} planId={planId!} />;
}

function PlanDetailContent({ data, planId }: { data: PlanDetailResponse; planId: string }) {
  const { plan, coverages, annual_cap_uf, uf_value_today, annual_cap_note, cta_url, cta_text } = data;
  const location = useLocation();
  const priceCLP = useMemo(
    () => plan.price_uf * (uf_value_today > 0 ? uf_value_today : 0),
    [plan.price_uf, uf_value_today],
  );

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const accentColor = plan.color && /^#[0-9A-Fa-f]{3,8}$/.test(plan.color) ? plan.color : '#2E8B7A';
  const heroBackground: React.CSSProperties = plan.hero_image_url
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url("${plan.hero_image_url}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `linear-gradient(135deg, ${accentColor}, #0f172a)`,
      };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNavbar pathname={location.pathname} />

      {/* Hero */}
      <section
        className="relative w-full text-white"
        style={heroBackground}
      >
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-16 min-h-[220px] md:min-h-[260px] flex flex-col justify-center gap-4">
          <div className="flex items-center gap-1" aria-label={`Plan ${plan.tier ?? ''}`}>
            {Array.from({ length: starsForTier(plan.tier) }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-300 text-yellow-300" />
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">plan {plan.name}</h1>
          <p className="text-base md:text-lg">
            <span className="opacity-85">Costo plan mensual: </span>
            <span className="font-semibold">{formatUF(plan.price_uf)} UF</span>
            {uf_value_today > 0 && (
              <span className="opacity-85"> / {formatCLP(priceCLP)}</span>
            )}
          </p>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {plan.pdf_url && planId ? (
              <a
                href={getPlanPDFDownloadURL(planId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur hover:bg-white/20 border border-white/30"
              >
                <FileText className="h-4 w-4" /> Ver plan en PDF
              </a>
            ) : (
              <span />
            )}
            <SocialShare shareUrl={shareUrl} planName={plan.name} />
          </div>
        </div>
      </section>

      {/* Coverages title band */}
      <div className="bg-[#555555] text-white text-center tracking-[0.3em] py-3 text-sm md:text-base font-semibold uppercase">
        Coberturas
      </div>

      {/* Coverages grid */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-8 md:py-10">
          {coverages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Este plan aún no tiene coberturas configuradas.</p>
          ) : (
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              {coverages.map((cv) => (
                <CoverageCard key={cv.id} coverage={cv} accentColor={accentColor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer (annual cap + CTA) */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-[#2a2a2a] text-white p-6 md:p-10">
          <p className="text-xs uppercase tracking-[0.3em] opacity-70 mb-2">Tope anual</p>
          <p className="text-3xl md:text-4xl font-bold mb-3">{formatUF(annual_cap_uf)} UF</p>
          <p className="text-sm leading-relaxed opacity-90">{annual_cap_note}</p>
        </div>
        <a
          href={cta_url}
          target={cta_url.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="bg-[#999999] text-white p-6 md:p-10 flex items-center justify-center text-center hover:bg-[#7f7f7f] transition-colors"
        >
          <span className="text-xl md:text-3xl font-bold tracking-wide uppercase flex items-center gap-3">
            {cta_text}
            <span aria-hidden>→</span>
          </span>
        </a>
      </section>

      <footer className="bg-[#E0E8FF] px-4 md:px-8 py-8 md:py-10 mt-auto">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Link to="/inicio" className="flex items-center">
            <img
              src="/assets/logo woof.svg"
              alt="Mishiwoof Logo"
              className="h-8 md:h-12"
              style={{ filter: 'grayscale(100%)' }}
            />
          </Link>
        </div>
      </footer>
    </div>
  );
}

function CoverageCard({
  coverage,
  accentColor,
}: {
  coverage: PlanDetailResponse['coverages'][number];
  accentColor: string;
}) {
  const hasCoverage = coverage.coverage_percentage > 0;
  return (
    <div className="border-b border-gray-200 pb-4">
      <h3 className="text-sm md:text-base font-bold uppercase tracking-wide text-gray-900 mb-1">
        {coverage.name}
      </h3>
      {hasCoverage ? (
        <p className="text-sm md:text-base text-gray-700">
          {formatPercentage(coverage.coverage_percentage)}
          {coverage.cap_uf_per_event != null && (
            <> (TOPE {formatUF(coverage.cap_uf_per_event)} UF)</>
          )}
        </p>
      ) : (
        <p className="text-sm md:text-base text-gray-500 italic">Sin cobertura</p>
      )}
      {coverage.events_annual != null && coverage.events_annual > 0 && (
        <p className="text-xs md:text-sm mt-0.5" style={{ color: accentColor }}>
          Máximo {formatUF(coverage.events_annual)} eventos por año
        </p>
      )}
      {coverage.disclaimer && (
        <p className="text-xs text-gray-500 italic mt-1">{coverage.disclaimer}</p>
      )}
    </div>
  );
}

function SocialShare({ shareUrl, planName }: { shareUrl: string; planName: string }) {
  const text = `Conoce el ${planName} de Mishiwoof`;

  const openPopup = (url: string) => {
    window.open(
      url,
      'share-popup',
      'width=600,height=500,menubar=no,toolbar=no,resizable=yes,scrollbars=yes',
    );
  };

  const shareFacebook = () =>
    openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);

  const shareTwitter = () =>
    openPopup(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
    );

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}: ${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const shareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado, comparte en tu historia de Instagram');
    } catch {
      toast.error('No pudimos copiar el link. Cópialo manualmente desde la barra de direcciones.');
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="text-sm opacity-85 flex items-center gap-1.5">
        <Share2 className="h-4 w-4" /> Compartir en:
      </span>
      <button
        type="button"
        onClick={shareFacebook}
        aria-label="Compartir en Facebook"
        className="rounded-full bg-white/10 p-2 hover:bg-white/20 border border-white/30 transition-colors"
      >
        <Facebook className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={shareInstagram}
        aria-label="Copiar link para Instagram"
        className="rounded-full bg-white/10 p-2 hover:bg-white/20 border border-white/30 transition-colors"
      >
        <Instagram className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={shareTwitter}
        aria-label="Compartir en X"
        className="rounded-full bg-white/10 p-2 hover:bg-white/20 border border-white/30 transition-colors"
      >
        <Twitter className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={shareWhatsApp}
        aria-label="Compartir en WhatsApp"
        className="rounded-full bg-white/10 p-2 hover:bg-white/20 border border-white/30 transition-colors"
      >
        <WhatsAppIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  // lucide-react doesn't ship a WhatsApp brand icon, so we inline it.
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.85 11.85 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 5.99L0 24l6.18-1.62A11.93 11.93 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.48-8.52ZM12 22a9.94 9.94 0 0 1-5.07-1.39l-.36-.21-3.66.96.98-3.57-.24-.37A9.96 9.96 0 1 1 22 12c0 5.52-4.48 10-10 10Zm5.45-7.27c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37s-1.05 1.02-1.05 2.5 1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.55.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

function TopNavbar({ pathname }: { pathname: string }) {
  return (
    <nav className="bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/inicio" className="flex items-center">
          <img src="/assets/logo woof.svg" alt="Mishiwoof" className="h-10 md:h-12" />
        </Link>
        <div className="flex items-center gap-2 md:gap-4 text-sm md:text-base">
          <Link
            to="/inicio"
            className="rounded-full px-3 md:px-5 py-1.5 hover:border-violet-500 border-2 border-transparent transition-colors"
          >
            Home
          </Link>
          <Link
            to="/planes"
            className={`rounded-full px-3 md:px-5 py-1.5 border-2 border-transparent transition-colors ${
              pathname.startsWith('/planes') ? 'text-[#FF6F61] font-semibold' : 'hover:border-violet-500'
            }`}
          >
            Ver planes
          </Link>
        </div>
      </div>
    </nav>
  );
}

function PlanDetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 border-b" />
      <Skeleton className="h-[260px] w-full rounded-none" />
      <div className="h-10 bg-[#555555]" />
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8 grid gap-6 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

function upsertMetaTag(attr: 'name' | 'property', value: string): HTMLMetaElement {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  return tag;
}

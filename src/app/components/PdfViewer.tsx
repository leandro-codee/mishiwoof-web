import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Download,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Worker configuration (singleton)
let workerConfigured = false;
function ensureWorker() {
  if (workerConfigured) return;
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.js',
    import.meta.url,
  ).toString();
  workerConfigured = true;
}
ensureWorker();

const ZOOM_STEP = 0.25;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 500;

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px', ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}

type ViewerState = 'idle' | 'loading' | 'success' | 'error' | 'fallback';

interface PdfViewerProps {
  url: string;
  width?: number;
}

export function PdfViewer({ url, width = 600 }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [viewerState, setViewerState] = useState<ViewerState>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: sentinelRef, isInView } = useInView();

  useEffect(() => {
    setNumPages(null);
    setPageNumber(1);
    setZoom(1);
    setViewerState('idle');
    setRetryCount(0);
    setRetryKey((k) => k + 1);
  }, [url]);

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const shouldLoad = isInView && viewerState !== 'fallback';

  useEffect(() => {
    if (shouldLoad && viewerState === 'idle') setViewerState('loading');
  }, [shouldLoad, viewerState]);

  const handleLoadSuccess = useCallback(({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    setViewerState('success');
    setRetryCount(0);
  }, []);

  const handleLoadError = useCallback((err: Error) => {
    console.error('PDF load error:', err);
    setRetryCount((prev) => {
      const next = prev + 1;
      if (next <= MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, prev);
        setTimeout(() => {
          setViewerState('loading');
          setRetryKey((k) => k + 1);
        }, delay);
        setViewerState('error');
      } else {
        setViewerState('fallback');
      }
      return next;
    });
  }, []);

  const handleManualRetry = useCallback(() => {
    setRetryCount(0);
    setViewerState('loading');
    setRetryKey((k) => k + 1);
  }, []);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2))), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2))), []);
  const handlePrevPage = useCallback(() => setPageNumber((p) => Math.max(1, p - 1)), []);
  const handleNextPage = useCallback(() => setPageNumber((p) => Math.min(numPages ?? p, p + 1)), [numPages]);

  const handleToggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setFullscreen(true);
    } else {
      await document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const effectiveWidth = useMemo(() => width * zoom, [width, zoom]);

  if (!isInView) {
    return (
      <div ref={sentinelRef} className="w-full flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="animate-pulse rounded-md bg-muted" style={{ width, height: 400 }} />
      </div>
    );
  }

  if (viewerState === 'fallback') {
    return (
      <div ref={sentinelRef} className="w-full flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-300">
            <AlertTriangle className="h-3 w-3" />
            Modo iframe
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={handleManualRetry}>
            <RotateCw className="h-3 w-3" />
            Reintentar
          </Button>
        </div>
        <iframe src={url} width="100%" height={600} style={{ border: 'none' }} title="PDF Preview" />
      </div>
    );
  }

  if (viewerState === 'error' && retryCount <= MAX_RETRIES) {
    return (
      <div ref={sentinelRef} className="w-full flex flex-col items-center justify-center gap-3 py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground">Reintentando... ({retryCount}/{MAX_RETRIES})</p>
      </div>
    );
  }

  return (
    <div
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (sentinelRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={`w-full flex flex-col items-center gap-2 ${fullscreen ? 'bg-background p-4 overflow-auto' : ''}`}
    >
      {viewerState === 'success' && numPages && (
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[60px] text-center">{pageNumber} / {numPages}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextPage} disabled={pageNumber >= numPages}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomOut} disabled={zoom <= ZOOM_MIN}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleZoomIn} disabled={zoom >= ZOOM_MAX}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleToggleFullscreen}>
            {fullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" asChild>
            <a href={url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      )}

      <div className="overflow-auto max-w-full">
        <Document
          key={retryKey}
          file={url}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div className="flex items-center justify-center p-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </div>
          }
        >
          {viewerState === 'success' && numPages && (
            <Page pageNumber={pageNumber} width={effectiveWidth} renderTextLayer renderAnnotationLayer />
          )}
        </Document>
      </div>
    </div>
  );
}

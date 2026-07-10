'use client';

import {useMemo, useRef, useState} from 'react';
import {Download, Link2} from 'lucide-react';
import {QRCodeCanvas, QRCodeSVG} from 'qrcode.react';
import {useTranslations} from 'next-intl';

export function QrCodePanel({defaultUrl}: {defaultUrl: string}) {
  const t = useTranslations('qrcode');
  const [url, setUrl] = useState(defaultUrl);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const safeUrl = useMemo(() => url.trim() || defaultUrl, [url, defaultUrl]);

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'orridi-marmitte-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function downloadSvg() {
    const svg = svgRef.current?.querySelector('svg');
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'orridi-marmitte-qrcode.svg';
    link.href = objectUrl;
    link.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="qr-layout">
      <div className="qr-card">
        <div className="qr-visible" ref={canvasRef}>
          <QRCodeCanvas
            value={safeUrl}
            size={1024}
            level="H"
            marginSize={4}
            bgColor="#f7f4ec"
            fgColor="#173f35"
            title={t('imageTitle')}
          />
        </div>
        <div className="sr-only" ref={svgRef} aria-hidden="true">
          <QRCodeSVG
            value={safeUrl}
            size={1024}
            level="H"
            marginSize={4}
            bgColor="#f7f4ec"
            fgColor="#173f35"
          />
        </div>
      </div>

      <div className="qr-controls">
        <label htmlFor="qr-url">
          <Link2 size={18} aria-hidden="true" />
          {t('urlLabel')}
        </label>
        <input
          id="qr-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://example.vercel.app"
          inputMode="url"
        />
        <p>{t('urlHelp')}</p>
        <div className="button-row">
          <button type="button" className="button button-primary" onClick={downloadPng}>
            <Download size={17} aria-hidden="true" /> {t('downloadPng')}
          </button>
          <button type="button" className="button button-secondary" onClick={downloadSvg}>
            <Download size={17} aria-hidden="true" /> {t('downloadSvg')}
          </button>
        </div>
        <div className="print-note">
          <strong>{t('printTitle')}</strong>
          <p>{t('printText')}</p>
        </div>
      </div>
    </div>
  );
}

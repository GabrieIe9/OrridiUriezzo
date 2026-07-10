'use client';

import Image from 'next/image';
import {Check, Copy, Share2, X} from 'lucide-react';
import {useRef, useState} from 'react';

type Props = {
  shareUrl: string;
  buttonLabel: string;
  title: string;
  description: string;
  closeLabel: string;
  nativeShareLabel: string;
  copyLabel: string;
  copiedLabel: string;
  qrAlt: string;
};

export function ShareQrButton({
  shareUrl,
  buttonLabel,
  title,
  description,
  closeLabel,
  nativeShareLabel,
  copyLabel,
  copiedLabel,
  qrAlt
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
    setCopied(false);
  }

  async function shareSite() {
    if (navigator.share) {
      try {
        await navigator.share({title, text: description, url: shareUrl});
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await copyUrl();
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      const input = document.createElement('textarea');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <>
      <button type="button" className="button button-primary home-share-button" onClick={openDialog}>
        <Share2 size={18} aria-hidden="true" />
        {buttonLabel}
      </button>

      <dialog
        ref={dialogRef}
        className="share-dialog"
        aria-labelledby="share-dialog-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
        onClose={() => setCopied(false)}
      >
        <div className="share-dialog-panel">
          <button type="button" className="dialog-close" onClick={closeDialog} aria-label={closeLabel}>
            <X size={21} aria-hidden="true" />
          </button>

          <span className="share-dialog-icon" aria-hidden="true"><Share2 size={22} /></span>
          <h2 id="share-dialog-title">{title}</h2>
          <p>{description}</p>

          <div className="share-qr-frame">
            <Image
              src="/qrcode.png"
              alt={qrAlt}
              width={640}
              height={640}
              sizes="(max-width: 520px) 78vw, 360px"
              priority
            />
          </div>

          <code className="share-url">{shareUrl}</code>

          <div className="share-dialog-actions">
            <button type="button" className="button button-primary" onClick={shareSite}>
              <Share2 size={17} aria-hidden="true" /> {nativeShareLabel}
            </button>
            <button type="button" className="button button-secondary" onClick={copyUrl}>
              {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
              {copied ? copiedLabel : copyLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

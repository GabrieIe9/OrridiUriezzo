'use client';

import {ArrowUp, Bot, LoaderCircle, MessageCircle, Send, X} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {FormEvent, useEffect, useRef, useState} from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_INPUT_LENGTH = 600;

export function FloatingTools() {
  const t = useTranslations('assistant');
  const locale = useLocale();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isLoading]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value || isLoading) return;

    const userMessage: ChatMessage = {role: 'user', content: value};
    const nextMessages = [...messages, userMessage].slice(-10);
    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({locale, messages: nextMessages})
      });
      const data = (await response.json()) as {answer?: string; error?: string};

      if (!response.ok || !data.answer) {
        throw new Error(data.error || t('error'));
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer
      };
      setMessages((current) => [...current, assistantMessage].slice(-12));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="floating-tools">
      {isOpen && (
        <section className="ai-chat-panel" role="dialog" aria-modal="false" aria-labelledby="ai-chat-title">
          <header className="ai-chat-header">
            <span className="ai-chat-avatar" aria-hidden="true"><Bot size={20} /></span>
            <div>
              <strong id="ai-chat-title">{t('title')}</strong>
              <small>{t('subtitle')}</small>
            </div>
            <button type="button" className="ai-chat-close" onClick={() => setIsOpen(false)} aria-label={t('close')}>
              <X size={19} aria-hidden="true" />
            </button>
          </header>

          <div className="ai-chat-messages" ref={messagesRef} aria-live="polite">
            <div className="chat-message chat-message-assistant">
              <span className="sr-only">{t('assistantLabel')}: </span>
              {t('welcome')}
            </div>

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat-message chat-message-${message.role}`}
              >
                <span className="sr-only">
                  {message.role === 'user' ? t('youLabel') : t('assistantLabel')}: {' '}
                </span>
                {message.content}
              </div>
            ))}

            {isLoading && (
              <div className="chat-message chat-message-assistant chat-loading" aria-label={t('sending')}>
                <LoaderCircle className="spin" size={18} aria-hidden="true" />
                <span>{t('sending')}</span>
              </div>
            )}
          </div>

          <form className="ai-chat-form" onSubmit={submitMessage}>
            {error && <p className="ai-chat-error" role="alert">{error}</p>}
            <div className="ai-chat-input-row">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, MAX_INPUT_LENGTH))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                maxLength={MAX_INPUT_LENGTH}
                placeholder={t('placeholder')}
                aria-label={t('placeholder')}
              />
              <button type="submit" disabled={!input.trim() || isLoading} aria-label={t('send')}>
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
            <small className="ai-chat-scope">{t('scopeNote')}</small>
          </form>
        </section>
      )}

      <div className="floating-buttons">
        {showBackToTop && (
          <button
            type="button"
            className="floating-button back-to-top-button"
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            aria-label={t('backToTop')}
            title={t('backToTop')}
          >
            <ArrowUp size={21} aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          className={`floating-button ai-chat-toggle${isOpen ? ' is-open' : ''}`}
          onClick={() => setIsOpen((current) => !current)}
          aria-label={isOpen ? t('close') : t('open')}
          aria-expanded={isOpen}
          title={isOpen ? t('close') : t('open')}
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

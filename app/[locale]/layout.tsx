import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {Header} from '@/components/header';
import {Footer} from '@/components/footer';
import {ServiceWorkerRegister} from '@/components/service-worker-register';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <Header />
          <div id="main-content">{children}</div>
          <Footer />
          <ServiceWorkerRegister />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

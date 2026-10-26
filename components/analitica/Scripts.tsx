"use client";

import Script from "next/script";
import { useConsentimiento } from "./Consentimiento";

const GA = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * Google Analytics 4 y Meta Pixel.
 * Solo se cargan si el visitante aceptó y si el ID está configurado: sin ID,
 * no se descarga nada y el sitio no pesa ni un byte de más.
 */
export function ScriptsAnalitica() {
  const { estado } = useConsentimiento();
  if (estado !== "aceptado") return null;

  return (
    <>
      {GA ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {PIXEL ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}
    </>
  );
}

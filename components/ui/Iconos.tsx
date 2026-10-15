/**
 * Íconos SVG inline equivalentes a los de Font Awesome 6 que usa el sitio actual.
 * Van inline para no cargar una librería de íconos completa (mejor rendimiento).
 * Heredan el color con `currentColor` y el tamaño con `width`/`height`.
 */
import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const base = (props: Props) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
  focusable: "false" as const,
  ...props,
});

export function IconoInstagram(props: Props) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.6.22 1 .5 1.4.95.45.44.73.84.95 1.4.17.44.36 1.05.42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.22.6-.5 1-.95 1.4-.44.45-.84.73-1.4.95-.44.17-1.05.36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42-.6-.22-1-.5-1.4-.95-.45-.44-.73-.84-.95-1.4-.17-.44-.36-1.05-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.22-.6.5-1 .95-1.4.44-.45.84-.73 1.4-.95.44-.17 1.05-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.98c-3.14 0-3.5.01-4.73.07-.94.04-1.4.18-1.73.3-.42.17-.72.36-1.04.68-.32.32-.51.62-.68 1.04-.12.33-.26.79-.3 1.73-.06 1.23-.07 1.6-.07 4.73s.01 3.5.07 4.73c.04.94.18 1.4.3 1.73.17.42.36.72.68 1.04.32.32.62.51 1.04.68.33.12.79.26 1.73.3 1.23.06 1.6.07 4.73.07s3.5-.01 4.73-.07c.94-.04 1.4-.18 1.73-.3.42-.17.72-.36 1.04-.68.32-.32.51-.62.68-1.04.12-.33.26-.79.3-1.73.06-1.23.07-1.6.07-4.73s-.01-3.5-.07-4.73c-.04-.94-.18-1.4-.3-1.73a2.8 2.8 0 0 0-.68-1.04 2.8 2.8 0 0 0-1.04-.68c-.33-.12-.79-.26-1.73-.3-1.23-.06-1.6-.07-4.73-.07Zm0 3.37a4.45 4.45 0 1 1 0 8.9 4.45 4.45 0 0 1 0-8.9Zm0 7.34a2.89 2.89 0 1 0 0-5.78 2.89 2.89 0 0 0 0 5.78Zm5.66-7.52a1.04 1.04 0 1 1-2.08 0 1.04 1.04 0 0 1 2.08 0Z" />
    </svg>
  );
}

export function IconoWhatsApp(props: Props) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.17-1.36a9.93 9.93 0 0 0 4.87 1.25h.01c5.5 0 9.96-4.46 9.96-9.96 0-2.66-1.04-5.16-2.92-7.04A9.88 9.88 0 0 0 12.04 2Zm0 18.19h-.01a8.26 8.26 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.24 8.24 0 0 1-1.26-4.37c0-4.57 3.72-8.28 8.28-8.28 2.21 0 4.29.86 5.85 2.43a8.22 8.22 0 0 1 2.42 5.86c0 4.57-3.72 8.28-8.29 8.28Zm4.54-6.2c-.25-.13-1.47-.73-1.7-.81-.23-.09-.4-.13-.56.12-.17.25-.65.81-.8.98-.14.16-.29.19-.54.06a6.73 6.73 0 0 1-1.99-1.23 7.47 7.47 0 0 1-1.38-1.72c-.14-.25-.02-.38.11-.51.11-.12.25-.3.37-.46.13-.16.17-.27.25-.44.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.83-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.22.89 2.4 1.02 2.57.12.17 1.73 2.64 4.19 3.7.58.25 1.04.4 1.4.52.59.18 1.12.16 1.54.1.46-.07 1.42-.58 1.62-1.15.2-.56.2-1.05.14-1.15-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function IconoTikTok(props: Props) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-1.84-2.48V9.77a5.68 5.68 0 1 0 4.94 5.63V8.9a7.3 7.3 0 0 0 4.26 1.37V7.17a4.25 4.25 0 0 1-3.2-1.35Z" />
    </svg>
  );
}

export function IconoFlecha(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconoMenu(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconoCerrar(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconoTelefono(props: Props) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path d="M6.6 10.8c1.2 2.3 3.1 4.2 5.4 5.4l1.8-1.8c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1-8.3 0-15-6.7-15-15 0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1l-1.8 1.8Z" />
    </svg>
  );
}

export function IconoCorreo(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function IconoPin(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function IconoReloj(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </svg>
  );
}

export function IconoAuto(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13.5 4.8 8a2 2 0 0 1 1.9-1.4h10.6A2 2 0 0 1 19.2 8L21 13.5M3 13.5h18v4.2a.8.8 0 0 1-.8.8h-1.6a.8.8 0 0 1-.8-.8v-1.2H6.2v1.2a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8v-4.2Z" />
      <circle cx="7.2" cy="16.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="16.8" cy="16.5" r=".9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconoEstrella(props: Props) {
  return (
    <svg {...base(props)} fill="currentColor">
      <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95L12 2.6Z" />
    </svg>
  );
}

export function IconoCheck(props: Props) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

/**
 * Datos de la empresa y contenido fijo del sitio.
 * Fuente: pgasesorias.cl (textos reales, con ortografía corregida).
 * Cualquier dato de contacto se edita SOLO aquí.
 */

export const sitio = {
  nombre: "PG Asesorías",
  razonSocial: "PG Servicios Automotrices SpA",
  tagline:
    "Compra/venta de autos usados verificados en Santiago ✓ Asesoría técnica experta ✓ Garantía real ✓ Mecánica a domicilio ✓ Scanner/Diagnóstico a domicilio ✓ Revisión Técnica ✓ Revisión Pre-Compra ✓",
  descripcion:
    "Compra, vende o repara tu vehículo con total confianza. Expertos en soluciones automotrices integrales en Santiago de Chile.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pgasesorias.cl",
  idioma: "es-CL",
} as const;

export const contacto = {
  telefono: "+56 9 4618 9034",
  telefonoE164: "+56946189034",
  whatsapp: "56946189034",
  email: "info@pgasesorias.cl",
  horario: "Lun – Vie: 9:00 AM – 5:00 PM",
  direccion: {
    calle: "Av. Apoquindo 6410, oficina 212",
    comuna: "Las Condes",
    ciudad: "Santiago",
    region: "Región Metropolitana",
    pais: "CL",
  },
  mapsUrl: "https://maps.app.goo.gl/Ci22kWQ3zYajE7148",
  mapsCalificacion: "5,0",
  mapsResenas: "Ver perfil en Google Maps",
} as const;

export const redes = {
  instagram: {
    usuario: "@pgasesorias",
    url: "https://www.instagram.com/pgasesorias/",
  },
  tiktok: {
    usuario: "@pgasesoriaschile",
    url: "https://www.tiktok.com/@pgasesoriaschile",
  },
} as const;

/** Mensaje por defecto para el botón de WhatsApp del header/footer. */
export const WHATSAPP_MENSAJE_DEFECTO =
  "Hola PG! Necesito un servicio automotriz, me puedes ayudar? 🚗✅✅";

/** Arma el enlace de WhatsApp con un mensaje prellenado. */
export function whatsappUrl(mensaje: string = WHATSAPP_MENSAJE_DEFECTO): string {
  return `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/* ─────────────────────────── Navegación ─────────────────────────── */

export type ItemMenu = { etiqueta: string; href: string };

/** Orden del menú del sitio actual, con la ortografía corregida. */
export const menuPrincipal: readonly ItemMenu[] = [
  { etiqueta: "Inicio", href: "/" },
  { etiqueta: "Vehículos en venta", href: "/vehiculos-en-venta" },
  { etiqueta: "Servicios Automotrices", href: "/servicios" },
  { etiqueta: "Nosotros", href: "/nosotros" },
  { etiqueta: "Contacto", href: "/contacto" },
  { etiqueta: "Compramos tu Vehículo", href: "/vende_tu_vehiculo" },
  { etiqueta: "Blog", href: "/blog" },
  { etiqueta: "Flota de Empresas", href: "/flota_de_empresas" },
] as const;

/** Columna "Contenido" del footer. */
export const menuFooter: readonly ItemMenu[] = [
  { etiqueta: "Inicio", href: "/" },
  { etiqueta: "Vehículos en venta", href: "/vehiculos-en-venta" },
  { etiqueta: "Servicios", href: "/servicios" },
  { etiqueta: "Nosotros", href: "/nosotros" },
  { etiqueta: "Vende tu Vehículo", href: "/vende_tu_vehiculo" },
  { etiqueta: "Flota de Empresas", href: "/flota_de_empresas" },
  { etiqueta: "Contacto", href: "/contacto" },
] as const;

/* ─────────────────────────── Contenido ─────────────────────────── */

/**
 * Contadores de la home. Valores reales leídos del sitio
 * (hoy no se ven por un bug del plugin de contadores).
 */
export const contadores = [
  { valor: 100, sufijo: "+", etiqueta: "Vehículos vendidos con éxito" },
  { valor: 250, sufijo: "+", etiqueta: "Servicios automotrices realizados" },
  { valor: 500, sufijo: "+", etiqueta: "Clientes satisfechos" },
  {
    valor: 7,
    sufijo: "",
    etiqueta: "Servicios especializados y personalizados a tu disposición",
  },
] as const;

export type Servicio = {
  slug: string;
  titulo: string;
  descripcion: string;
  icono: string | null;
};

/** Los 8 servicios con los textos del sitio actual. */
export const servicios: readonly Servicio[] = [
  {
    slug: "consignacion-virtual",
    titulo: "Consignación Virtual",
    descripcion:
      "Vende tu vehículo sin complicaciones ni riesgos. Nos encargamos de la promoción, coordinación con compradores, gestión de trámites y acompañamiento en todo el proceso. Supervisamos cada paso legal, incluyendo la transferencia vehicular, documentación notarial y validaciones vía Autofact para garantizar una transacción transparente y segura. Tú recibes el pago, nosotros hacemos el resto.",
    icono: "/iconos/consignacion-virtual.svg",
  },
  {
    slug: "inspeccion-pre-compra",
    titulo: "Inspección Pre-compra",
    descripcion:
      "Revisamos cada detalle mecánico, estético, electrónico y legal para que tomes la mejor decisión al momento de comprar tu vehículo. Con total transparencia y claridad. Entregamos un informe técnico completo con observaciones y recomendaciones.",
    icono: null,
  },
  {
    slug: "mantencion-automotriz",
    titulo: "Mantención automotriz",
    descripcion:
      "Mantén tu auto en perfecto estado sin perder tiempo en talleres. Retiramos tu vehículo en el lugar que más te acomode, buscamos repuestos de calidad, realizamos la mantención y entregamos tu vehículo limpio junto con un informe de trabajos realizados.",
    icono: "/iconos/mantencion-automotriz.svg",
  },
  {
    slug: "traslado-revision-tecnica",
    titulo: "Traslado Revisión Técnica",
    descripcion:
      "Coordinación y retiro de tu vehículo, traslado seguro a la planta de revisión técnica y devolución con la revisión al día. Incluye informe de trabajo detallado y servicio personalizado adaptado a las necesidades de cada cliente.",
    icono: "/iconos/traslado-revision-tecnica.svg",
  },
  {
    slug: "desabolladura-pintura",
    titulo: "Desabolladura y pintura",
    descripcion:
      "Reparación de abolladuras, rayas y golpes con acabado profesional y pintura de alta calidad. Igualación exacta del color original, retiro y entrega a domicilio con informe visual del progreso. Servicio personalizado y adaptado a las necesidades de cada cliente.",
    icono: "/iconos/desabolladura-pintura.svg",
  },
  {
    slug: "mecanica-general",
    titulo: "Mecánica General Automotriz",
    descripcion:
      "Reparaciones mecánicas y electromecánicas en general con repuestos de calidad, registro audiovisual del proceso y coordinación de retiro y entrega a domicilio. Servicio personalizado y adaptado a las necesidades de cada cliente.",
    icono: null,
  },
  {
    slug: "diagnostico-repros",
    titulo: "Diagnóstico Automotriz – Repros",
    descripcion:
      "Diagnóstico electrónico avanzado con scanner profesional para detectar y solucionar fallas eléctricas o electrónicas. Reprogramación (ECU remap) para optimizar potencia, rendimiento y eficiencia del motor con tecnología avanzada y calibraciones seguras.",
    icono: "/iconos/diagnostico-repros.svg",
  },
  {
    slug: "otros-servicios",
    titulo: "Otros Servicios Automotrices",
    descripcion:
      "¿Tienes una necesidad especial o un requerimiento fuera del catálogo? Creamos soluciones automotrices a medida, desde diagnósticos avanzados hasta servicios personalizados según tu vehículo y tus necesidades.",
    icono: null,
  },
] as const;

/** Los 4 pasos para agendar, textos del sitio actual. */
export const pasosAgenda = [
  {
    titulo: "Reserva a través de la web",
    descripcion:
      "Accede a nuestro sistema de agendamiento en línea desde cualquier dispositivo.",
  },
  {
    titulo: "Selecciona el servicio",
    descripcion:
      "Elige entre nuestras opciones: consignación virtual, mantención automotriz, revisiones pre-compra, mecánica general, diagnóstico automotriz, entre otros.",
  },
  {
    titulo: "Confirma tu cita",
    descripcion:
      "Escoge fecha y hora que más te acomode. Confirma tu solicitud en pocos clics.",
  },
  {
    titulo: "Recibe atención profesional",
    descripcion:
      "Recupera tu tiempo. Nosotros nos encargamos de darte una solución efectiva y personalizada.",
  },
] as const;

export const marca = {
  logo: "/marca/logo-pg-asesorias.webp",
  logoAncho: 790,
  logoAlto: 568,
  fotoTaller: "/marca/taller-nosotros.webp",
} as const;

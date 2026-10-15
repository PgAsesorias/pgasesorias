/** Formatos de Chile: precios en CLP y kilometraje con punto de miles. */

const nf = new Intl.NumberFormat("es-CL");

/** 23990000 → "$23.990.000" */
export function clp(monto: number): string {
  return `$${nf.format(Math.round(monto))}`;
}

/** 145000 → "145.000 km" */
export function km(kilometros: number): string {
  return `${nf.format(Math.round(kilometros))} km`;
}

/** 2018 → "Año 2018" */
export function anio(valor: number): string {
  return `Año ${valor}`;
}

/** Para los contadores de la home: 1500 → "1.500" */
export function numero(valor: number): string {
  return nf.format(valor);
}

/** Fecha corta legible: "14 oct 2026" */
export function fechaCorta(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

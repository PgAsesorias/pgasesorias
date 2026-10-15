/**
 * Verifica que toda clase de marca usada (bg-pg-*, text-pg-*, border-pg-*)
 * tenga su token declarado en el bloque @theme de app/globals.css.
 *
 *   npm run verificar:tokens
 *
 * Tailwind ignora en silencio una clase que no existe: el footer se puede
 * quedar sin fondo y nadie se entera hasta ver la página. Esto lo detecta.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const css = readFileSync("app/globals.css", "utf8");
const bloqueTema = css.slice(css.indexOf("@theme inline"));
/** Tokens declarados, por familia: "color" y "shadow". */
const declarados = {
  color: new Set([...bloqueTema.matchAll(/--color-(pg-[a-z0-9-]+):/g)].map((m) => m[1])),
  shadow: new Set([...bloqueTema.matchAll(/--shadow-(pg-[a-z0-9-]+):/g)].map((m) => m[1])),
};

const archivos = [];
function recorrer(dir) {
  for (const entrada of readdirSync(dir)) {
    if (entrada === "node_modules" || entrada.startsWith(".")) continue;
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) recorrer(ruta);
    else if ([".tsx", ".ts"].includes(extname(ruta))) archivos.push(ruta);
  }
}
for (const dir of ["app", "components"]) recorrer(dir);

const usados = new Map();
for (const archivo of archivos) {
  const contenido = readFileSync(archivo, "utf8");
  for (const m of contenido.matchAll(
    /(bg|text|border|from|to|via|fill|stroke|ring|shadow)-(pg-[a-z0-9-]+)/g,
  )) {
    const familia = m[1] === "shadow" ? "shadow" : "color";
    const clave = `${familia}:${m[2]}`;
    if (!usados.has(clave)) usados.set(clave, archivo);
  }
}

const faltantes = [...usados.entries()].filter(
  ([clave]) => {
    const [familia, token] = clave.split(":");
    return !declarados[familia].has(token);
  },
);

if (faltantes.length === 0) {
  console.log(`✓ ${usados.size} clases de marca, todas con token declarado.`);
  process.exit(0);
}

console.error("✗ Clases de marca sin token en @theme (Tailwind las ignora):\n");
for (const [clave, archivo] of faltantes) {
  const [familia, token] = clave.split(":");
  console.error(`  --${familia}-${token}   usado en ${archivo}`);
}
console.error("\nAgrégalos al bloque @theme inline de app/globals.css.");
process.exit(1);

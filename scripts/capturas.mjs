/**
 * Capturas de pantalla del sitio en desktop y móvil, para revisar el diseño.
 *
 *   npm run dev            (en otra terminal)
 *   npm run capturas       → guarda PNG en .capturas/
 *   npm run capturas -- /servicios /nosotros   → solo esas rutas
 *
 * Además reporta scroll horizontal y errores de consola de cada página.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SALIDA = ".capturas";

const rutasPorDefecto = [
  ["home", "/"],
  ["catalogo", "/vehiculos-en-venta"],
  ["ficha", "/vehiculos-en-venta/toyota-4runner-2018-santiago"],
];

const args = process.argv.slice(2);
const paginas = args.length
  ? args.map((r) => [r.replace(/^\//, "").replace(/\//g, "-") || "home", r])
  : rutasPorDefecto;

mkdirSync(SALIDA, { recursive: true });

const navegador = await chromium.launch();
const errores = [];
let problemas = 0;

for (const [ancho, etiqueta] of [[1440, "desktop"], [390, "movil"]]) {
  const ctx = await navegador.newContext({
    viewport: { width: ancho, height: ancho === 1440 ? 900 : 844 },
    deviceScaleFactor: 2,
    isMobile: ancho < 500,
    hasTouch: ancho < 500,
  });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") errores.push(`[${etiqueta}] ${m.text()}`);
  });
  page.on("pageerror", (e) => errores.push(`[${etiqueta}] ${e.message}`));

  for (const [nombre, ruta] of paginas) {
    const res = await page.goto(BASE + ruta, { waitUntil: "networkidle" });

    // Recorrer la página como lo haría una persona: dispara la carga diferida
    // de las imágenes y las animaciones que esperan a entrar en pantalla.
    await page.evaluate(async () => {
      const paso = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += paso) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });
    // Esperar a que todas las imágenes visibles terminen de cargar.
    await page
      .waitForFunction(
        () => [...document.images].every((img) => img.complete),
        null,
        { timeout: 15000 },
      )
      .catch(() => {});
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SALIDA}/${nombre}-${etiqueta}.png`, fullPage: true });

    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    if (desborde) problemas++;
    console.log(
      `  ${nombre}-${etiqueta}: HTTP ${res?.status()} · ${alto}px${desborde ? "  ⚠ SCROLL HORIZONTAL" : ""}`,
    );
  }
  await ctx.close();
}

await navegador.close();

const unicos = [...new Set(errores)];
console.log(unicos.length ? `\nErrores de consola:\n${unicos.join("\n")}` : "\nSin errores de consola.");
process.exit(problemas > 0 ? 1 : 0);

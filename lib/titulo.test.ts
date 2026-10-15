import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generarSlug, generarTitulo, slugificar } from "./titulo.ts";

describe("generarTitulo", () => {
  it("arma el título completo con el formato del sitio", () => {
    assert.equal(
      generarTitulo({
        marca: "Toyota",
        modelo: "4Runner",
        version: "Limited",
        motor: "V6 4.0",
        transmision: "Automática",
        puertas: 5,
        traccion: "4x4",
        anio: 2018,
      }),
      "Toyota 4Runner Limited V6 4.0 Automático 5 Puertas, Tracción 4X4, Año 2018",
    );
  });

  it("escribe Mecánico cuando la transmisión es Manual", () => {
    assert.equal(
      generarTitulo({
        marca: "Nissan",
        modelo: "New Versa",
        version: "Advance",
        motor: "1.6",
        transmision: "Manual",
        puertas: 4,
        traccion: "4x2",
        anio: 2022,
      }),
      "Nissan New Versa Advance 1.6 Mecánico 4 Puertas, Tracción 4X2, Año 2022",
    );
  });

  it("omite las partes que faltan sin dejar comas sueltas", () => {
    assert.equal(
      generarTitulo({ marca: "Peugeot", modelo: "3008", anio: 2020 }),
      "Peugeot 3008, Año 2020",
    );
    assert.equal(
      generarTitulo({ marca: "Kia", modelo: "Sportage", transmision: "Automática" }),
      "Kia Sportage Automático",
    );
  });

  it("deja AWD tal cual", () => {
    assert.equal(
      generarTitulo({ marca: "Subaru", modelo: "Forester", traccion: "AWD", anio: 2019 }),
      "Subaru Forester, Tracción AWD, Año 2019",
    );
  });

  it("normaliza espacios de más", () => {
    assert.equal(
      generarTitulo({ marca: "  Ford ", modelo: "Ranger  XLT", anio: 2021 }),
      "Ford Ranger XLT, Año 2021",
    );
  });
});

describe("slugificar", () => {
  it("quita tildes, pasa a minúsculas y usa guiones", () => {
    assert.equal(
      slugificar("Toyota 4Runner Limited V6 4.0 Automático 5 Puertas, Tracción 4X4, Año 2018"),
      "toyota-4runner-limited-v6-4-0-automatico-5-puertas-traccion-4x4-ano-2018",
    );
  });

  it("normaliza el símbolo × que usa el sitio actual", () => {
    assert.equal(slugificar("Tracción 4×2"), "traccion-4x2");
  });

  it("no deja guiones al inicio, al final ni repetidos", () => {
    assert.equal(slugificar("  ¡Hola!!  Mundo--  "), "hola-mundo");
  });

  it("es estable: slugificar dos veces da lo mismo", () => {
    const s = slugificar("Mercedes-Benz Clase C 200 Automático, Año 2017");
    assert.equal(slugificar(s), s);
  });
});

describe("generarSlug", () => {
  it("sale del título generado", () => {
    assert.equal(
      generarSlug({
        marca: "Maxus",
        modelo: "T60",
        motor: "2.8",
        transmision: "Manual",
        puertas: 4,
        traccion: "4x4",
        anio: 2021,
      }),
      "maxus-t60-2-8-mecanico-4-puertas-traccion-4x4-ano-2021",
    );
  });
});

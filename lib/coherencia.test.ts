import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { leerTitulo, puedePublicarse, verificarVehiculo } from "./coherencia.ts";

const HOY = new Date("2026-10-14T12:00:00Z");

describe("leerTitulo", () => {
  it("lee todo de un título completo", () => {
    assert.deepEqual(
      leerTitulo("Toyota 4Runner Limited V6 4.0 Automático 5 Puertas, Tracción 4X4, Año 2018"),
      { transmision: "Automática", combustible: null, traccion: "4x4", puertas: 5, anio: 2018 },
    );
  });

  it("entiende Mecánico, Diésel y el × del sitio actual", () => {
    assert.deepEqual(
      leerTitulo("Maxus T60 DC GL MT 2.8 Diésel Mecánico 4 Puertas, Tracción 4×2, Año 2022"),
      { transmision: "Manual", combustible: "Diésel", traccion: "4x2", puertas: 4, anio: 2022 },
    );
  });
});

describe("verificarVehiculo", () => {
  it("detecta el bug real del Maxus T60", () => {
    const h = verificarVehiculo(
      {
        titulo: "Maxus T60 DC GL MT 2.8 Diésel Mecánico 4 Puertas, Tracción 4x2, Año 2022",
        transmision: "Automática",
        combustible: "Gasolina",
        anio: 2022,
      },
      HOY,
    );
    assert.equal(h.filter((x) => x.severidad === "error").length, 2);
    assert.equal(h.find((x) => x.campo === "transmision")?.sugerencia, "Manual");
    assert.equal(h.find((x) => x.campo === "combustible")?.sugerencia, "Diésel");
    assert.equal(puedePublicarse(h), false);
  });

  it("acepta un vehículo coherente", () => {
    const h = verificarVehiculo(
      {
        titulo: "Nissan New Versa Advance 1.6 Mecánico 4 Puertas, Tracción 4x2, Año 2022",
        transmision: "Manual",
        traccion: "4x2",
        puertas: 4,
        anio: 2022,
        kilometraje: 41000,
        precio: 10990000,
        precio_oferta: 9990000,
        fotos: Array(13).fill(null),
      },
      HOY,
    );
    assert.deepEqual(h, []);
    assert.equal(puedePublicarse(h), true);
  });

  it("rechaza el precio de oferta mayor o igual al precio", () => {
    const h = verificarVehiculo({ precio: 10_000_000, precio_oferta: 10_000_000 }, HOY);
    assert.equal(h[0].campo, "precio_oferta");
    assert.equal(h[0].severidad, "error");
  });

  it("rechaza el año 1970 que muestra hoy la tarjeta del Peugeot", () => {
    const h = verificarVehiculo({ anio: 1949 }, HOY);
    assert.equal(h[0].severidad, "error");
    const futuro = verificarVehiculo({ anio: 2027 }, HOY);
    assert.equal(futuro[0].severidad, "aviso");
  });

  it("avisa si la tracción del título no está en el campo", () => {
    const h = verificarVehiculo(
      { titulo: "Toyota Hilux Automático 4 Puertas, Tracción 4X4, Año 2020", traccion: null },
      HOY,
    );
    assert.equal(h[0].campo, "traccion");
    assert.equal(h[0].sugerencia, "4x4");
    assert.equal(puedePublicarse(h), true); // es aviso, no bloquea
  });

  it("avisa por kilometraje poco plausible y por pocas fotos", () => {
    const h = verificarVehiculo({ anio: 2024, kilometraje: 300000, fotos: [1] }, HOY);
    assert.ok(h.some((x) => x.campo === "kilometraje"));
    assert.ok(h.some((x) => x.campo === "fotos"));
  });
});

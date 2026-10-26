import { NextResponse, type NextRequest } from "next/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { TIPOS_EVENTO, type TipoEvento } from "@/lib/analitica";
import type { Json } from "@/lib/database.types";

/**
 * Registra un evento de analítica propia.
 * Es tolerante a fallos a propósito: si algo sale mal responde 204 igual, para
 * no ensuciar la consola del visitante ni afectar su navegación.
 */
export async function POST(request: NextRequest) {
  try {
    const cuerpo = (await request.json()) as {
      tipo?: string;
      vehiculo?: string | null;
      pagina?: string;
      utm?: Record<string, string> | null;
    };

    if (!cuerpo.tipo || !TIPOS_EVENTO.includes(cuerpo.tipo as TipoEvento)) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = crearClienteAdmin();

    let vehiculoId: string | null = null;
    if (cuerpo.vehiculo) {
      const { data } = await supabase
        .from("vehiculos")
        .select("id")
        .eq("slug", cuerpo.vehiculo)
        .maybeSingle();
      vehiculoId = data?.id ?? null;
    }

    await supabase.from("eventos").insert({
      tipo: cuerpo.tipo as TipoEvento,
      vehiculo_id: vehiculoId,
      pagina: cuerpo.pagina?.slice(0, 500) ?? null,
      utm: (cuerpo.utm ?? null) as Json | null,
    });

    // Contador de vistas del vehículo, para el panel.
    if (vehiculoId && cuerpo.tipo === "vista_ficha") {
      // Si la función atómica existe (supabase/upgrades.sql) se usa esa;
      // si no, se suma leyendo y escribiendo.
      const { error } = await supabase.rpc("incrementar_vistas", { id_vehiculo: vehiculoId });
      if (error) {
        const { data } = await supabase
          .from("vehiculos")
          .select("vistas")
          .eq("id", vehiculoId)
          .maybeSingle();
        if (data) {
          await supabase
            .from("vehiculos")
            .update({ vistas: (data.vistas ?? 0) + 1 })
            .eq("id", vehiculoId);
        }
      }
    }
  } catch {
    /* nunca romper por la analítica */
  }

  return new NextResponse(null, { status: 204 });
}

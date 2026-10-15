"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { sitio } from "@/lib/site";

export type EstadoLogin = { error?: string; aviso?: string } | null;

/** ¿El correo está autorizado a entrar al panel? */
async function estaAutorizado(email: string): Promise<boolean> {
  const admin = crearClienteAdmin();
  const { data } = await admin
    .from("admin_users")
    .select("user_id")
    .ilike("email", email.trim())
    .maybeSingle();
  return data !== null;
}

/** Entrar con correo y contraseña. */
export async function iniciarSesion(
  _previo: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const volver = String(formData.get("volver") ?? "/admin");

  if (!email || !password) {
    return { error: "Escribe tu correo y tu contraseña." };
  }

  if (!(await estaAutorizado(email))) {
    return { error: "Este correo no tiene acceso al panel." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : "No pudimos iniciar sesión. Intenta de nuevo.",
    };
  }

  revalidatePath("/admin", "layout");
  redirect(volver.startsWith("/admin") ? volver : "/admin");
}

/** Entrar con un enlace enviado por correo, sin contraseña. */
export async function enviarEnlaceMagico(
  _previo: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) return { error: "Escribe tu correo." };
  if (!(await estaAutorizado(email))) {
    return { error: "Este correo no tiene acceso al panel." };
  }

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${sitio.url}/admin/auth/confirmar` },
  });

  if (error) {
    return { error: "No pudimos enviar el enlace. Prueba con tu contraseña." };
  }

  return { aviso: `Te enviamos un enlace a ${email}. Revisa tu correo.` };
}

/** Cambiar la contraseña del usuario que tiene la sesión abierta. */
export async function cambiarPassword(
  _previo: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const nueva = String(formData.get("password") ?? "");
  const repetida = String(formData.get("password2") ?? "");

  if (nueva.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (nueva !== repetida) return { error: "Las dos contraseñas no son iguales." };

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: nueva });

  if (error) return { error: "No pudimos cambiar la contraseña. Intenta de nuevo." };

  return { aviso: "Contraseña actualizada." };
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

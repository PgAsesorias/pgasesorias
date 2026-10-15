import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesión de Supabase en cada visita y protege /admin.
 *
 * La comprobación de "es administrador" se hace además en el servidor, dentro
 * del layout de /admin: el middleware es la primera barrera, no la única.
 */
export async function middleware(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          for (const { name, value } of cookies) request.cookies.set(name, value);
          respuesta = NextResponse.next({ request });
          for (const { name, value, options } of cookies) {
            respuesta.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const esRutaAdmin = ruta.startsWith("/admin");
  const esLogin = ruta === "/admin/login" || ruta.startsWith("/admin/auth");

  if (esRutaAdmin && !esLogin && !user) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/login";
    destino.searchParams.set("volver", ruta);
    return NextResponse.redirect(destino);
  }

  if (esLogin && user) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}

export const config = {
  matcher: [
    /*
     * Todas las rutas menos archivos estáticos e imágenes optimizadas.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|marca|iconos|.*\\.(?:svg|png|jpg|jpeg|webp|gif|ico|woff2?)$).*)",
  ],
};

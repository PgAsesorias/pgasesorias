import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FormularioLogin } from "@/components/admin/FormularioLogin";
import { marca, sitio } from "@/lib/site";

export const metadata: Metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src={marca.logo}
            alt={sitio.nombre}
            width={marca.logoAncho}
            height={marca.logoAlto}
            priority
            className="h-16 w-auto"
          />
          <h1 className="mt-5 text-[28px]">Panel de administración</h1>
          <p className="mt-2 text-[15px] text-pg-muted">
            Solo para el equipo de PG Asesorías.
          </p>
        </div>

        <Suspense fallback={<div className="h-80 rounded-card bg-pg-white shadow-pg-card" />}>
          <FormularioLogin />
        </Suspense>

        <p className="mt-8 text-center text-[14px]">
          <Link href="/" className="text-pg-muted no-underline hover:text-pg-red">
            ← Volver al sitio
          </Link>
        </p>
      </div>
    </div>
  );
}

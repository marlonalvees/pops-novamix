import { redirect } from "next/navigation";
import { getAuthPayload, HUB_LOGIN_URL, isPopsAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const payload = await getAuthPayload();

  if (!payload) {
    redirect(HUB_LOGIN_URL);
  }

  if (!isPopsAdmin(payload)) {
    return (
      <main className="flex-1 w-full max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-gray-text">Acesso restrito</h1>
        <p className="mt-2 text-sm text-gray-dark">
          Seu usuário não tem permissão para gerenciar POPs. Fale com um
          administrador no Hub Novamix.
        </p>
      </main>
    );
  }

  return <>{children}</>;
}

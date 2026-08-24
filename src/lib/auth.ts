import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

export const HUB_LOGIN_URL = "https://hub.lojanovamix.com.br/login";

export type TokenPermission = {
  module: string;
  access: string;
};

export type TokenSector = {
  id: number;
  name: string;
};

export type TokenPayload = {
  sub: number;
  role: string;
  permissions: TokenPermission[];
  branchs: { id: number; name: string }[];
  sector: TokenSector | null;
  exp: number;
};

/**
 * O token vem do Hub Novamix (cookie "token" no domínio .lojanovamix.com.br,
 * ou header Authorization em chamadas diretas à API). Este app não tem
 * usuários próprios — apenas confia no payload já assinado pelo hub.
 */
export async function getAuthPayload(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const token =
    cookieStore.get("token")?.value ??
    headerStore.get("authorization")?.split(" ")[1];

  if (!token || !process.env.JWT_SECRET) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export function isPopsAdmin(payload: TokenPayload | null): boolean {
  if (!payload) return false;
  if (payload.role === "admin") return true;
  return payload.permissions.some(
    (p) => p.module === "pops" && p.access === "admin"
  );
}

/**
 * Um admin do hub (role "admin") gerencia POPs de qualquer categoria.
 * Um admin do módulo "pops" só gerencia POPs cuja categoria seja o nome
 * do setor dele (setor e categoria são o mesmo valor por definição).
 */
export function canManageCategoria(
  payload: TokenPayload | null,
  categoriaNome: string
): boolean {
  if (!isPopsAdmin(payload)) return false;
  if (payload!.role === "admin") return true;
  return payload!.sector?.name === categoriaNome;
}

/**
 * POP privado só é visível para quem está logado e é do mesmo setor
 * (setor e categoria são o mesmo valor, ver canManageCategoria), ou para
 * um admin do módulo POPs. POP público é sempre visível.
 */
export function canViewPop(
  payload: TokenPayload | null,
  pop: { privado: boolean; categoria: string }
): boolean {
  if (!pop.privado) return true;
  if (!payload) return false;
  if (isPopsAdmin(payload)) return true;
  return payload.sector?.name === pop.categoria;
}

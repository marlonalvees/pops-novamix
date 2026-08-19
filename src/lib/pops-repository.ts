import type { PoolClient } from "pg";
import { db } from "@/lib/db";
import { canManageCategoria, type TokenPayload } from "@/lib/auth";
import { ForbiddenError, PopNotFoundError } from "@/lib/errors";
import { slugify } from "@/lib/slug";
import { removerImagem, removerPastaPop, salvarImagem } from "@/lib/storage";
import type { ArquivoPasso, PopInput } from "@/lib/pop-form-data";
import type { Pop, PopResumo } from "@/types/pop";

export async function listCategorias() {
  const result = await db.query(
    `SELECT id, nome, slug FROM pops.categorias ORDER BY ordem, nome`
  );
  return result.rows as { id: number; nome: string; slug: string }[];
}

export async function listTags() {
  const result = await db.query(`SELECT id, nome FROM pops.tags ORDER BY nome`);
  return result.rows as { id: number; nome: string }[];
}

export async function listPops(
  opts: { categoria?: string; includeInactive?: boolean } = {}
): Promise<PopResumo[]> {
  const condicoes: string[] = [];
  const params: unknown[] = [];

  if (!opts.includeInactive) condicoes.push(`p.status = true`);
  if (opts.categoria) {
    params.push(opts.categoria);
    condicoes.push(`c.nome = $${params.length}`);
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : "";

  const result = await db.query(
    `SELECT p.slug, p.titulo, c.nome AS categoria,
            COALESCE(array_agg(t.nome) FILTER (WHERE t.nome IS NOT NULL), '{}') AS tags
     FROM pops.pops p
     JOIN pops.categorias c ON c.id = p.categoria_id
     LEFT JOIN pops.pop_tags pt ON pt.pop_id = p.id
     LEFT JOIN pops.tags t ON t.id = pt.tag_id
     ${where}
     GROUP BY p.id, p.slug, p.titulo, c.nome
     ORDER BY p.created_at DESC`,
    params
  );

  return result.rows;
}

export async function getPopBySlug(
  slug: string,
  opts: { includeInactive?: boolean } = {}
): Promise<Pop | null> {
  const condicaoStatus = opts.includeInactive ? "" : "AND p.status = true";

  const popResult = await db.query(
    `SELECT p.id, p.slug, p.titulo, c.nome AS categoria, p.video_url
     FROM pops.pops p
     JOIN pops.categorias c ON c.id = p.categoria_id
     WHERE p.slug = $1 ${condicaoStatus}`,
    [slug]
  );
  if (popResult.rows.length === 0) return null;
  const popRow = popResult.rows[0];

  const tagsResult = await db.query(
    `SELECT t.nome
     FROM pops.pop_tags pt
     JOIN pops.tags t ON t.id = pt.tag_id
     WHERE pt.pop_id = $1
     ORDER BY t.nome`,
    [popRow.id]
  );

  const passosResult = await db.query(
    `SELECT id, ordem, descricao FROM pops.passos WHERE pop_id = $1 ORDER BY ordem`,
    [popRow.id]
  );

  const imagensResult = await db.query(
    `SELECT pi.id, pi.passo_id, pi.nome_arquivo, pi.legenda, pi.ordem
     FROM pops.passo_imagens pi
     JOIN pops.passos ps ON ps.id = pi.passo_id
     WHERE ps.pop_id = $1
     ORDER BY pi.ordem`,
    [popRow.id]
  );

  const imagensPorPasso = new Map<
    number,
    { id: number; nomeArquivo: string; legenda: string | null; url: string }[]
  >();
  for (const img of imagensResult.rows) {
    const lista = imagensPorPasso.get(img.passo_id) ?? [];
    lista.push({
      id: img.id,
      nomeArquivo: img.nome_arquivo,
      legenda: img.legenda,
      url: `/imagens/${popRow.slug}/${img.nome_arquivo}`,
    });
    imagensPorPasso.set(img.passo_id, lista);
  }

  return {
    slug: popRow.slug,
    titulo: popRow.titulo,
    categoria: popRow.categoria,
    tags: tagsResult.rows.map((r) => r.nome),
    videoUrl: popRow.video_url ?? "",
    passos: passosResult.rows.map((p) => ({
      id: p.id,
      descricao: p.descricao,
      imagens: imagensPorPasso.get(p.id) ?? [],
    })),
  };
}

async function resolveCategoriaId(
  client: PoolClient,
  nome: string
): Promise<{ id: number; nome: string }> {
  const existente = await client.query(
    `SELECT id, nome FROM pops.categorias WHERE nome = $1`,
    [nome]
  );
  if (existente.rows.length > 0) return existente.rows[0];

  const inserida = await client.query(
    `INSERT INTO pops.categorias (nome, slug) VALUES ($1, $2) RETURNING id, nome`,
    [nome, slugify(nome)]
  );
  return inserida.rows[0];
}

async function resolveTagIds(client: PoolClient, nomes: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const nome of nomes) {
    const result = await client.query(
      `INSERT INTO pops.tags (nome) VALUES ($1)
       ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
       RETURNING id`,
      [nome]
    );
    ids.push(result.rows[0].id);
  }
  return ids;
}

async function gerarSlugUnico(client: PoolClient, titulo: string): Promise<string> {
  const base = slugify(titulo) || "pop";
  let slug = base;
  let contador = 2;

  while (true) {
    const result = await client.query(`SELECT 1 FROM pops.pops WHERE slug = $1`, [slug]);
    if (result.rowCount === 0) return slug;
    slug = `${base}-${contador++}`;
  }
}

export async function createPop(
  input: PopInput,
  arquivos: ArquivoPasso[],
  userHubId: number | null
): Promise<string> {
  const client = await db.connect();
  let slug: string | undefined;

  try {
    await client.query("BEGIN");

    const categoria = await resolveCategoriaId(client, input.categoria);
    slug = await gerarSlugUnico(client, input.titulo);

    const popResult = await client.query(
      `INSERT INTO pops.pops (slug, titulo, categoria_id, video_url, user_hub_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [slug, input.titulo, categoria.id, input.videoUrl || null, userHubId]
    );
    const popId = popResult.rows[0].id;

    const tagIds = await resolveTagIds(client, input.tags);
    for (const tagId of tagIds) {
      await client.query(
        `INSERT INTO pops.pop_tags (pop_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [popId, tagId]
      );
    }

    const passoIds: number[] = [];
    for (let i = 0; i < input.passos.length; i++) {
      const result = await client.query(
        `INSERT INTO pops.passos (pop_id, ordem, descricao) VALUES ($1, $2, $3) RETURNING id`,
        [popId, i + 1, input.passos[i].descricao]
      );
      passoIds.push(result.rows[0].id);
    }

    const arquivosPorPasso = agruparPorPasso(arquivos);
    for (const [passoIndex, itens] of arquivosPorPasso) {
      const passoId = passoIds[passoIndex];
      if (!passoId) continue;

      for (let i = 0; i < itens.length; i++) {
        const nomeArquivo = await salvarImagem(slug, itens[i].file);
        await client.query(
          `INSERT INTO pops.passo_imagens (passo_id, nome_arquivo, ordem) VALUES ($1, $2, $3)`,
          [passoId, nomeArquivo, i + 1]
        );
      }
    }

    await client.query("COMMIT");
    return slug;
  } catch (error) {
    await client.query("ROLLBACK");
    if (slug) await removerPastaPop(slug).catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function updatePop(
  slugAtual: string,
  input: PopInput,
  arquivos: ArquivoPasso[],
  authPayload: TokenPayload | null
): Promise<void> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const existente = await client.query(
      `SELECT p.id, c.nome AS categoria_nome
       FROM pops.pops p
       JOIN pops.categorias c ON c.id = p.categoria_id
       WHERE p.slug = $1
       FOR UPDATE`,
      [slugAtual]
    );
    if (existente.rows.length === 0) throw new PopNotFoundError();

    const popId = existente.rows[0].id;
    const categoriaAtualNome = existente.rows[0].categoria_nome;

    if (!canManageCategoria(authPayload, categoriaAtualNome)) throw new ForbiddenError();
    if (!canManageCategoria(authPayload, input.categoria)) throw new ForbiddenError();

    const categoria = await resolveCategoriaId(client, input.categoria);

    await client.query(
      `UPDATE pops.pops SET titulo = $1, categoria_id = $2, video_url = $3, updated_at = NOW()
       WHERE id = $4`,
      [input.titulo, categoria.id, input.videoUrl || null, popId]
    );

    await client.query(`DELETE FROM pops.pop_tags WHERE pop_id = $1`, [popId]);
    const tagIds = await resolveTagIds(client, input.tags);
    for (const tagId of tagIds) {
      await client.query(
        `INSERT INTO pops.pop_tags (pop_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [popId, tagId]
      );
    }

    const passosExistentes = (
      await client.query(`SELECT id FROM pops.passos WHERE pop_id = $1`, [popId])
    ).rows.map((r) => r.id as number);

    const idsSubmetidos = new Set(
      input.passos.filter((p) => p.id).map((p) => p.id as number)
    );
    const passosRemovidos = passosExistentes.filter((id) => !idsSubmetidos.has(id));

    for (const passoId of passosRemovidos) {
      const imagens = (
        await client.query(
          `SELECT nome_arquivo FROM pops.passo_imagens WHERE passo_id = $1`,
          [passoId]
        )
      ).rows;
      for (const img of imagens) {
        await removerImagem(slugAtual, img.nome_arquivo).catch(() => {});
      }
      await client.query(`DELETE FROM pops.passos WHERE id = $1`, [passoId]);
    }

    const passoIds: number[] = [];
    for (let i = 0; i < input.passos.length; i++) {
      const passo = input.passos[i];

      if (passo.id) {
        await client.query(
          `UPDATE pops.passos SET descricao = $1, ordem = $2 WHERE id = $3`,
          [passo.descricao, i + 1, passo.id]
        );
        passoIds.push(passo.id);

        const manter = new Set(passo.manterImagens ?? []);
        const imagensAtuais = (
          await client.query(
            `SELECT id, nome_arquivo FROM pops.passo_imagens WHERE passo_id = $1`,
            [passo.id]
          )
        ).rows;

        for (const img of imagensAtuais) {
          if (!manter.has(img.id)) {
            await removerImagem(slugAtual, img.nome_arquivo).catch(() => {});
            await client.query(`DELETE FROM pops.passo_imagens WHERE id = $1`, [img.id]);
          }
        }
      } else {
        const result = await client.query(
          `INSERT INTO pops.passos (pop_id, ordem, descricao) VALUES ($1, $2, $3) RETURNING id`,
          [popId, i + 1, passo.descricao]
        );
        passoIds.push(result.rows[0].id);
      }
    }

    const arquivosPorPasso = agruparPorPasso(arquivos);
    for (const [passoIndex, itens] of arquivosPorPasso) {
      const passoId = passoIds[passoIndex];
      if (!passoId) continue;

      const base = (
        await client.query(
          `SELECT COALESCE(MAX(ordem), 0) AS max FROM pops.passo_imagens WHERE passo_id = $1`,
          [passoId]
        )
      ).rows[0].max;

      for (let i = 0; i < itens.length; i++) {
        const nomeArquivo = await salvarImagem(slugAtual, itens[i].file);
        await client.query(
          `INSERT INTO pops.passo_imagens (passo_id, nome_arquivo, ordem) VALUES ($1, $2, $3)`,
          [passoId, nomeArquivo, base + i + 1]
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deletePop(
  slug: string,
  authPayload: TokenPayload | null
): Promise<void> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const existente = await client.query(
      `SELECT p.id, c.nome AS categoria_nome
       FROM pops.pops p
       JOIN pops.categorias c ON c.id = p.categoria_id
       WHERE p.slug = $1
       FOR UPDATE`,
      [slug]
    );
    if (existente.rows.length === 0) throw new PopNotFoundError();
    if (!canManageCategoria(authPayload, existente.rows[0].categoria_nome)) {
      throw new ForbiddenError();
    }

    await client.query(`DELETE FROM pops.pops WHERE id = $1`, [existente.rows[0].id]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await removerPastaPop(slug).catch(() => {});
}

function agruparPorPasso(arquivos: ArquivoPasso[]): Map<number, ArquivoPasso[]> {
  const mapa = new Map<number, ArquivoPasso[]>();
  for (const item of arquivos) {
    const lista = mapa.get(item.passoIndex) ?? [];
    lista.push(item);
    mapa.set(item.passoIndex, lista);
  }
  return mapa;
}

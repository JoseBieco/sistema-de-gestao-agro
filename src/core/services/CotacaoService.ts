import { prisma } from "@/lib/prisma";

export class CotacaoService {
  /**
   * Obtém a cotação inteligente consultando primeiro o cache local (DB)
   * Se não existir a cotação do dia, consome a API do AgroDoc AI.
   */
  async obterCotacaoDoDia(produto: string, uf: string = "SP") {
    const hojeStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const startOfDay = new Date(`${hojeStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${hojeStr}T23:59:59.999Z`);

    // Tentar achar no banco de dados primeiro
    const cacheLocal = await prisma.cotacaoHistorica.findFirst({
      where: {
        produto: produto,
        estado: uf,
        data: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { data: "desc" },
    });

    if (cacheLocal) {
      return {
        ...cacheLocal,
        _origem: "cache",
      };
    }

    // Não existe no banco, buscar na API AgroDoc AI
    try {
      const url = `https://agrodocai.com.br/api/v1/cotacao?produto=${produto}&uf=${uf}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro API AgroDoc: ${response.status}`);
      }

      const data = await response.json();

      let valor = 0;
      let unidade = "";

      if (produto === "boi_gordo") {
        // Tenta pegar o preço por UF, se não usa o CEPEA genérico
        valor = data.boi_gordo_uf?.preco || data.boi_gordo_cepea_sp || 0;
        unidade = "@";
      } else if (produto === "milho") {
        valor = data.milho || 0;
        unidade = "sc (60kg)";
      } else if (produto === "soja") {
        valor = data.soja || 0;
        unidade = "sc (60kg)";
      } else if (produto === "vaca_gorda") {
        valor = data.vaca_gorda || 0;
        unidade = "@";
      }

      // Salvar no banco de dados local
      const cotacaoSalva = await prisma.cotacaoHistorica.create({
        data: {
          data: data.atualizado ? new Date(data.atualizado) : new Date(hojeStr),
          produto: produto,
          valor: valor,
          estado: uf,
          unidade_medida: unidade,
          fonte: data.fonte || "AgroDoc AI",
          data_coleta: new Date(),
        },
      });

      return {
        ...cotacaoSalva,
        _origem: "api",
      };
    } catch (error) {
      console.error(`Falha ao buscar a cotação de ${produto}:`, error);

      // Fallback: tentar buscar a cotação mais recente já registrada, mesmo de dias anteriores
      const ultimaCotacaoConhecida = await prisma.cotacaoHistorica.findFirst({
        where: { produto, estado: uf },
        orderBy: { data: "desc" },
      });

      if (ultimaCotacaoConhecida) {
        return {
          ...ultimaCotacaoConhecida,
          _origem: "fallback_cache",
        };
      }

      // Se der tudo errado e não tiver cache
      return null;
    }
  }
}

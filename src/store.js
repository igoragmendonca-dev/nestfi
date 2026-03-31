import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useFinancasStore = create(
  persist(
    (set, get) => ({

      // ─── SALÁRIO ─────────────────────────────────────────────────
      salario: {
        salarioBasico: 15414.88,
        rmnr: 43678.25,
        anuenio: 2867.1676,
        gratFuncaoGer: 2302.59,
        heDesembarque: 1662.3363,
        auxilioEducacional: 962.0,
        inss: 988.07,
        ams: 462.4464,
        // IR e Petros são calculados automaticamente
      },
      updateSalario: (campo, valor) =>
        set((s) => ({ salario: { ...s.salario, [campo]: parseFloat(valor) || 0 } })),

      // ─── OUTRAS RENDAS ────────────────────────────────────────────
      // tipo: 'simples' | 'salario'
      // tipo 'salario' tem campos: salarioBasico, outrasVerbas[], descontos[]
      outrasRendas: [
        {
          id: 1,
          nome: 'Aluguel Imóvel SP',
          tipo: 'simples',
          valor: 3200,
          despesas: [
            { id: 11, nome: 'IPTU rateado', valor: 120 },
            { id: 12, nome: 'Administração imobiliária (6%)', valor: 192 },
          ],
          descricao: 'Apartamento Moema — contrato vigente até dez/2025',
          recorrente: true,
          categoria: 'Aluguel',
        },
        {
          id: 2,
          nome: 'Dividendos / FIIs',
          tipo: 'simples',
          valor: 2100,
          despesas: [],
          descricao: 'BOVA11 + HGLG11 + MXRF11 — isento IR (FIIs PF)',
          recorrente: false,
          categoria: 'Investimentos',
        },
        {
          id: 3,
          nome: 'Freelance Consultoria',
          tipo: 'simples',
          valor: 5000,
          despesas: [
            { id: 31, nome: 'Carnê-leão IR (~15%)', valor: 750 },
          ],
          descricao: 'Projetos pontuais de gestão estratégica',
          recorrente: false,
          categoria: 'Freelance',
        },
      ],
      addOutraRenda: (renda) =>
        set((s) => ({ outrasRendas: [...s.outrasRendas, { ...renda, id: Date.now(), despesas: [] }] })),
      updateOutraRenda: (id, dados) =>
        set((s) => ({ outrasRendas: s.outrasRendas.map((r) => (r.id === id ? { ...r, ...dados } : r)) })),
      removeOutraRenda: (id) =>
        set((s) => ({ outrasRendas: s.outrasRendas.filter((r) => r.id !== id) })),
      addDespesaRenda: (rendaId, despesa) =>
        set((s) => ({
          outrasRendas: s.outrasRendas.map((r) =>
            r.id === rendaId
              ? { ...r, despesas: [...(r.despesas || []), { ...despesa, id: Date.now() }] }
              : r
          ),
        })),
      removeDespesaRenda: (rendaId, despesaId) =>
        set((s) => ({
          outrasRendas: s.outrasRendas.map((r) =>
            r.id === rendaId
              ? { ...r, despesas: (r.despesas || []).filter((d) => d.id !== despesaId) }
              : r
          ),
        })),

      // ─── INVESTIMENTOS ────────────────────────────────────────────
      investimentos: [
        { id: 1, tipo: 'acoes', nome: 'PETR4', valor: 45000, rentabilidadeAnual: 12.5, descricao: 'Petrobras ON', quantidade: 500, precoMedio: 38.2, corretora: 'XP' },
        { id: 2, tipo: 'acoes', nome: 'BOVA11', valor: 82000, rentabilidadeAnual: 10.2, descricao: 'ETF Ibovespa', quantidade: 820, precoMedio: 100, corretora: 'XP' },
        { id: 3, tipo: 'acoes', nome: 'VALE3', valor: 38000, rentabilidadeAnual: 9.8, descricao: 'Vale ON', quantidade: 600, precoMedio: 63.3, corretora: 'XP' },
        { id: 4, tipo: 'fundoImobiliario', nome: 'HGLG11', valor: 25000, rentabilidadeAnual: 9.2, descricao: 'FII Logístico CSHG', quantidade: 125, precoMedio: 200, corretora: 'XP' },
        { id: 5, tipo: 'fundoImobiliario', nome: 'MXRF11', valor: 15000, rentabilidadeAnual: 11.5, descricao: 'Maxi Renda FII Papel', quantidade: 1500, precoMedio: 10, corretora: 'XP' },
        { id: 6, tipo: 'fundoImobiliario', nome: 'XPML11', valor: 18000, rentabilidadeAnual: 10.1, descricao: 'FII Shopping XP Malls', quantidade: 180, precoMedio: 100, corretora: 'XP' },
        { id: 7, tipo: 'tesouro', nome: 'Tesouro IPCA+ 2035', valor: 120000, rentabilidadeAnual: 6.8, descricao: 'IPCA + 6.8% a.a.', vencimento: '2035-01-01', corretora: 'Tesouro Direto' },
        { id: 8, tipo: 'tesouro', nome: 'Tesouro Selic 2027', valor: 55000, rentabilidadeAnual: 10.5, descricao: 'Pós-fixado Selic', vencimento: '2027-06-01', corretora: 'Tesouro Direto' },
        { id: 9, tipo: 'cdb', nome: 'CDB Nubank 120%CDI', valor: 80000, rentabilidadeAnual: 12.6, descricao: 'Venc. 2 anos', vencimento: '2026-08-01', corretora: 'Nubank' },
        { id: 10, tipo: 'cdb', nome: 'CDB Itaú 110%CDI', valor: 40000, rentabilidadeAnual: 11.55, descricao: 'Venc. 1 ano', vencimento: '2025-12-01', corretora: 'Itaú' },
        { id: 11, tipo: 'contaCorrente', nome: 'Conta Bradesco', valor: 12000, rentabilidadeAnual: 0, descricao: 'Conta salário', corretora: 'Bradesco' },
        { id: 12, tipo: 'contaInvestimento', nome: 'Conta XP Investimentos', valor: 35000, rentabilidadeAnual: 10.5, descricao: 'Conta remunerada XP', corretora: 'XP' },
        { id: 13, tipo: 'fgts', nome: 'FGTS Acumulado', valor: 68000, rentabilidadeAnual: 3.0, descricao: 'TR + 3% ao ano — CEF', corretora: 'CEF' },
        { id: 14, tipo: 'previdencia', nome: 'Petros BD', valor: 320000, rentabilidadeAnual: 8.5, descricao: 'Previdência complementar Petrobras', corretora: 'Petros' },
        { id: 15, tipo: 'previdencia', nome: 'VGBL XP Agressivo', valor: 45000, rentabilidadeAnual: 9.2, descricao: 'VGBL renda variável', corretora: 'XP' },
      ],
      addInvestimento: (inv) =>
        set((s) => ({ investimentos: [...s.investimentos, { ...inv, id: Date.now() }] })),
      updateInvestimento: (id, dados) =>
        set((s) => ({ investimentos: s.investimentos.map((i) => (i.id === id ? { ...i, ...dados } : i)) })),
      removeInvestimento: (id) =>
        set((s) => ({ investimentos: s.investimentos.filter((i) => i.id !== id) })),

      // ─── DESPESAS ────────────────────────────────────────────────
      categoriasDespesas: [
        {
          id: 1, nome: 'Fixos', cor: '#6366f1', icone: '🏠',
          itens: [
            { id: 101, nome: 'Prestação Atm', valor: 6900, observacao: 'Financiamento apartamento' },
            { id: 102, nome: 'Condomínio', valor: 1700, observacao: '' },
            { id: 103, nome: 'Light', valor: 500, observacao: 'Média trimestral' },
            { id: 104, nome: 'Gás', valor: 300, observacao: '' },
            { id: 105, nome: 'Vivo', valor: 180, observacao: 'Internet fibra + cel.' },
            { id: 106, nome: 'Claro', valor: 111, observacao: 'Celular backup' },
          ],
        },
        {
          id: 2, nome: 'Essenciais', cor: '#10b981', icone: '🛒',
          itens: [
            { id: 201, nome: 'Mercado', valor: 5000, observacao: '' },
            { id: 202, nome: 'Diarista', valor: 2000, observacao: '2x por semana' },
            { id: 203, nome: 'IPVA/Seguro', valor: 1000, observacao: 'Média mensal' },
            { id: 204, nome: 'Farmácia', valor: 500, observacao: '' },
            { id: 205, nome: 'Psicóloga Camila', valor: 400, observacao: '4 sessões/mês' },
            { id: 206, nome: 'Gasolina', valor: 400, observacao: '' },
            { id: 207, nome: 'Estética', valor: 300, observacao: '' },
            { id: 208, nome: 'Academia', valor: 109.9, observacao: '' },
          ],
        },
        {
          id: 3, nome: 'Crianças', cor: '#f59e0b', icone: '👶',
          itens: [
            { id: 301, nome: 'Escola Hugo', valor: 3691.33, observacao: 'Mensalidade + material' },
            { id: 302, nome: 'Babá', valor: 4000, observacao: 'Regime CLT' },
            { id: 303, nome: 'Psicóloga Hugo', valor: 900, observacao: '4 sessões/mês' },
            { id: 304, nome: 'Fono Hugo', valor: 680, observacao: '4 sessões/mês' },
            { id: 305, nome: 'Recreio Escola', valor: 335, observacao: '' },
            { id: 306, nome: 'Futebol Hugo', valor: 262, observacao: '' },
            { id: 307, nome: 'Natação Hugo', valor: 257, observacao: '' },
          ],
        },
        {
          id: 4, nome: 'Variáveis', cor: '#ec4899', icone: '🎭',
          itens: [
            { id: 401, nome: 'Restaurantes', valor: 3000, observacao: 'Média estimada' },
            { id: 402, nome: 'Compras', valor: 5000, observacao: 'Vestuário, casa, etc.' },
            { id: 403, nome: 'Viagens', valor: 8000, observacao: 'Média mensal projetada' },
            { id: 404, nome: 'Entretenimento', valor: 2000, observacao: 'Cinema, shows, etc.' },
            { id: 405, nome: 'Assinaturas', valor: 1010.668333, observacao: 'Ver aba Assinaturas', readonly: true },
          ],
        },
      ],
      addCategoria: (cat) =>
        set((s) => ({ categoriasDespesas: [...s.categoriasDespesas, { ...cat, id: Date.now(), itens: [] }] })),
      updateCategoria: (id, dados) =>
        set((s) => ({ categoriasDespesas: s.categoriasDespesas.map((c) => (c.id === id ? { ...c, ...dados } : c)) })),
      removeCategoria: (id) =>
        set((s) => ({ categoriasDespesas: s.categoriasDespesas.filter((c) => c.id !== id) })),
      addItemDespesa: (catId, item) =>
        set((s) => ({
          categoriasDespesas: s.categoriasDespesas.map((c) =>
            c.id === catId ? { ...c, itens: [...c.itens, { ...item, id: Date.now() }] } : c
          ),
        })),
      updateItemDespesa: (catId, itemId, dados) =>
        set((s) => ({
          categoriasDespesas: s.categoriasDespesas.map((c) =>
            c.id === catId
              ? { ...c, itens: c.itens.map((i) => (i.id === itemId ? { ...i, ...dados } : i)) }
              : c
          ),
        })),
      removeItemDespesa: (catId, itemId) =>
        set((s) => ({
          categoriasDespesas: s.categoriasDespesas.map((c) =>
            c.id === catId ? { ...c, itens: c.itens.filter((i) => i.id !== itemId) } : c
          ),
        })),

      // ─── ASSINATURAS ─────────────────────────────────────────────
      assinaturas: [
        { id: 1, nome: 'Livelo', valor: 285.0, categoria: 'Pontos/Milhas', ativa: true, vencimento: 5, observacao: 'Plano premium pontos' },
        { id: 2, nome: 'Clube Wine', valor: 89.0, categoria: 'Lazer', ativa: true, vencimento: 10, observacao: '2 garrafas/mês' },
        { id: 3, nome: 'Astrojourney', valor: 59.9, categoria: 'Lazer', ativa: true, vencimento: 15, observacao: '' },
        { id: 4, nome: 'Produtos Globo', valor: 59.8, categoria: 'Streaming', ativa: true, vencimento: 5, observacao: '' },
        { id: 5, nome: 'Globoplay', valor: 54.9, categoria: 'Streaming', ativa: true, vencimento: 5, observacao: '' },
        { id: 6, nome: 'Youtube Premium', valor: 53.9, categoria: 'Streaming', ativa: true, vencimento: 20, observacao: 'Família' },
        { id: 7, nome: 'Smiles', valor: 43.7, categoria: 'Pontos/Milhas', ativa: true, vencimento: 12, observacao: '' },
        { id: 8, nome: 'Clube Latam', valor: 42.9, categoria: 'Pontos/Milhas', ativa: true, vencimento: 8, observacao: '' },
        { id: 9, nome: 'Sem Parar', valor: 42.71, categoria: 'Mobilidade', ativa: true, vencimento: 1, observacao: 'Pedágio automático' },
        { id: 10, nome: 'O Globo', valor: 39.9, categoria: 'Notícias', ativa: true, vencimento: 3, observacao: '' },
        { id: 11, nome: 'Amazon Prime Canais', valor: 39.9, categoria: 'Streaming', ativa: true, vencimento: 18, observacao: '' },
        { id: 12, nome: 'Playstation Plus', valor: 39.66, categoria: 'Games', ativa: true, vencimento: 22, observacao: 'Essential mensal' },
        { id: 13, nome: 'Spotify', valor: 31.9, categoria: 'Música', ativa: true, vencimento: 7, observacao: 'Família' },
        { id: 14, nome: 'Mercado Livre Mais', valor: 24.9, categoria: 'Compras', ativa: true, vencimento: 14, observacao: 'Frete grátis' },
        { id: 15, nome: 'Amazon Music', valor: 21.9, categoria: 'Música', ativa: true, vencimento: 18, observacao: '' },
        { id: 16, nome: 'Apple CombiBill', valor: 19.9, categoria: 'Tech', ativa: true, vencimento: 25, observacao: 'iCloud + TV+' },
        { id: 17, nome: 'Amazon Prime BR', valor: 19.9, categoria: 'Compras', ativa: true, vencimento: 18, observacao: 'Frete + Prime Video' },
        { id: 18, nome: 'Nintendo Online', valor: 16.0, categoria: 'Games', ativa: true, vencimento: 30, observacao: 'Família' },
        { id: 19, nome: 'Fast Shop Prime', valor: 14.9, categoria: 'Compras', ativa: true, vencimento: 11, observacao: '' },
        { id: 20, nome: 'Amazon Ad Free', valor: 10.0, categoria: 'Compras', ativa: true, vencimento: 18, observacao: '' },
      ],
      addAssinatura: (ass) =>
        set((s) => ({ assinaturas: [...s.assinaturas, { ...ass, id: Date.now(), ativa: true }] })),
      updateAssinatura: (id, dados) =>
        set((s) => ({ assinaturas: s.assinaturas.map((a) => (a.id === id ? { ...a, ...dados } : a)) })),
      removeAssinatura: (id) =>
        set((s) => ({ assinaturas: s.assinaturas.filter((a) => a.id !== id) })),
      toggleAssinatura: (id) =>
        set((s) => ({ assinaturas: s.assinaturas.map((a) => (a.id === id ? { ...a, ativa: !a.ativa } : a)) })),

      // ─── FINANCIAMENTOS ──────────────────────────────────────────
      financiamentos: [
        {
          id: 1, nome: 'Apartamento Leblon', tipo: 'imovel',
          saldoDevedor: 680000, valorOriginal: 900000, taxaJuros: 9.5,
          prazoMeses: 240, parcelasMeses: 180, parcelaMensal: 6900,
          amortizacao: 'SAC', dataInicio: '2010-06-01',
          custos: [{ nome: 'Seguro MIP', valor: 180 }, { nome: 'Taxa Admin', valor: 25 }],
          observacao: 'CEF — TR + 9,5% a.a.',
        },
        {
          id: 2, nome: 'Porsche Cayenne 2023', tipo: 'veiculo',
          saldoDevedor: 285000, valorOriginal: 380000, taxaJuros: 12.5,
          prazoMeses: 48, parcelasMeses: 24, parcelaMensal: 8200,
          amortizacao: 'PRICE', dataInicio: '2023-01-01',
          custos: [{ nome: 'Seguro Auto', valor: 850 }],
          observacao: 'Banco Porsche Financial Services',
        },
      ],
      addFinanciamento: (fin) =>
        set((s) => ({ financiamentos: [...s.financiamentos, { ...fin, id: Date.now() }] })),
      updateFinanciamento: (id, dados) =>
        set((s) => ({ financiamentos: s.financiamentos.map((f) => (f.id === id ? { ...f, ...dados } : f)) })),
      removeFinanciamento: (id) =>
        set((s) => ({ financiamentos: s.financiamentos.filter((f) => f.id !== id) })),

      // ─── SIMULADOR ───────────────────────────────────────────────
      simulador: {
        patrimonioAtual: 897000,
        taxaJurosAnual: 8.5,
        aporteMensal: 5000,
        horizonte: 40,
        inflacaoAnual: 4.5,
        metaPatrimonio: 5000000,
      },
      updateSimulador: (dados) =>
        set((s) => ({ simulador: { ...s.simulador, ...dados } })),

      // ─── MARCOS EDITÁVEIS ────────────────────────────────────────
      marcos: [
        { id: 1, valor: 1000000,  label: 'R$1M',  emoji: '🥇' },
        { id: 2, valor: 5000000,  label: 'R$5M',  emoji: '💎' },
        { id: 3, valor: 10000000, label: 'R$10M', emoji: '👑' },
      ],
      updateMarco: (id, dados) =>
        set((s) => ({ marcos: s.marcos.map((m) => (m.id === id ? { ...m, ...dados } : m)) })),

    }),
    { name: 'financas-familia-storage' }
  )
)

export default useFinancasStore

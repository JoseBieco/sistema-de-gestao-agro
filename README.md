# Sistema de Gestão do Agro 🐮

Sistema completo de gestão agropecuária focado no controle eficiente de rebanho, manejo sanitário, gestão financeira e movimentação de pastagens. Desenvolvido com tecnologias modernas para garantir performance e escalabilidade.

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-green)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js_15_|_Supabase_|_Tailwind-blue)

## 🚀 Funcionalidades

### 🐄 Gestão de Rebanho
- Cadastro completo de animais (Brinco, Nome, Raça, Gênero).
- **Genealogia:** Rastreamento de parentesco (Mãe e Pai) com navegação facilitada.
- **Histórico de Peso:** Monitoramento da evolução ponderal e cálculo de GMD (Ganho Médio Diário).
- Controle de status (Ativo, Vendido, Morto).

### 💉 Controle Sanitário
- Cadastro de tipos de vacinas e medicamentos.
- **Agenda de Vacinação:** Visualização de vacinas pendentes, atrasadas e aplicadas.
- Aplicação em lote ou individual.

### 💰 Gestão Financeira
- Registro de **Compras e Vendas** de animais.
- Controle de **Parcelas** (A Pagar/A Receber) com suporte a anexos (fotos de promissórias/recibos).
- Geração automática de **Recibos** para impressão.
- Cadastro de Parceiros (Fornecedores e Compradores).

### 🌾 Manejo e Pastagens
- Cadastro de Locais (Pastos, Piquetes, Currais).
- **Controle de Lotação:** Visualização gráfica da ocupação de cada pasto.
- **Movimentação de Lote:** Transferência facilitada de animais entre locais com histórico de movimentação.

### 📊 Relatórios e BI
- Dashboard com indicadores principais (KPIs).
- Acompanhamento de Cotações Históricas (Arroba do Boi, Bezerro, Milho, etc.).
- Resumos financeiros e de inventário.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI:** [Shadcn/UI](https://ui.shadcn.com/) (Radix UI)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Backend / Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Gerenciamento de Estado:** React Server Components + Client Hooks

---

## ⚙️ Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (v18 ou superior)
- [PNPM](https://pnpm.io/) (Gerenciador de pacotes utilizado)

---

## 🚀 Como Rodar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/sistema-de-gestao-agro.git](https://github.com/seu-usuario/sistema-de-gestao-agro.git)
   cd sistema-de-gestao-agro```

2. **Instale as dependências:**
    ```bash npm install```

3. **Configuração do Ambiente (.env):** Crie um arquivo `.env.local` na raiz do projeto e preencha com as credenciais do seu projeto Supabase:
    ```text
    NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
    ```

4. **Configuração do Banco de Dados:** Execute os scripts SQL localizados na pasta `scripts/` no SQL Editor do Supabase na seguinte ordem para criar as tabelas e popular dados iniciais:

    1. `001_create_database_schema.sql` (Estrutura base)
    2. `002_seed_initial_data.sql` (Dados de raças e vacinas)
    3. `003_create_database_historical_data.sql` (Cotações)
    4. `004_create_management_schema.sql` (Pastos e Manejo)

## 📂 Estrutura do Projeto

    sistema-de-gestao-agro/
    ├── app/                # Páginas e Rotas (App Router)
    │   ├── animais/        # Gestão de animais
    │   ├── financeiro/     # Compras, vendas, parcelas
    │   ├── manejo/         # Gestão de pastos
    │   └── ...
    ├── components/         # Componentes React reutilizáveis
    │   ├── ui/             # Componentes base (Shadcn)
    │   ├── animals/        # Componentes específicos de animais
    │   ├── dashboard/      # Widgets do dashboard
    │   └── ...
    ├── lib/                # Utilitários e configurações
    │   ├── supabase/       # Cliente Supabase
    │   ├── types/          # Tipos TypeScript do Banco de Dados
    │   └── utils/          # Funções auxiliares
    └── scripts/            # Scripts SQL para setup do banco
    

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3. Faça o Commit (`git commit -m 'Adicionando nova feature'`)
4. Faça o Push (`git push origin feature/MinhaFeature`)
5 - Abra um Pull Request

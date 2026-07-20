# Sistema de Controle de Gastos

Desafio prático de desenvolvimento full-stack aplicando uma arquitetura moderna, escalável e de alto desempenho. O sistema gerencia o fluxo financeiro de um ecossistema familiar, aplicando travas de segurança diretamente nas regras de negócio da API.

## Tecnologias Utilizadas

### Back-end

- Ambiente de Runtime: .NET 8 / C#
- Persistência de Dados: Entity Framework Core
- Banco de Dados: SQLite (Armazenamento em arquivo local para agilidade de setup)

### Front-end

- Framework: React + TypeScript (Strict Mode)
- Ferramenta de Build: Vite
- Estilização: Tailwind CSS v4 (Arquitetura minimalista e flat)
- Comunicação: Axios

---

## Regras de Negócio Implementadas

### 1. Gestão

- O sistema opera com relacionamentos atômicos. Ao remover um membro familiar da base de dados, a API executa uma exclusão em cascata (Cascade Delete), eliminando imediatamente todas as movimentações financeiras atreladas àquele identificador, garantindo a integridade referencial do banco.

### 2. Restrição

- Membros da residência com idade inferior a 18 anos possuem bloqueio reativo na API. O sistema impede o lançamento de fluxos de entrada (Receitas) para menores, permitindo estritamente o registro de saídas (Despesas). A validação ocorre a nível de servidor, devolvendo respostas HTTP 400 (Bad Request) customizadas.

### 3. Consolidado Financeiro Geral

- A camada de inteligência do back-end realiza o agrupamento e rateio dos fluxos financeiros direto em queries LINQ otimizadas, entregando um DTO plano com os totais consolidados de receitas, despesas e saldo líquido individual e geral da residência.

---

## Como Executar o Projeto

Para rodar a aplicação completa, você precisará de dois terminais ativos simultaneamente (um para a API e outro para a interface).

### 1. Inicializando o Back-end (.NET)

Navegue até o diretório do servidor e inicie o ambiente:

```bash
cd backend/ControleGastos
dotnet run

###2. Inicializando o Front-end (React)
Em um novo terminal, navegue até a pasta da interface, instale as dependências e suba o servidor de desenvolvimento:
cd frontend
npm install
npm run dev
```

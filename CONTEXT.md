# ISOCS — Contexto do Projeto

## Visão Geral
Sistema de controle departamental para empresa de construção a seco (LSF).
- **Live:** https://isocs-f91df.web.app
- **Firebase Project:** isocs-f91df

## Stack
- React 19 + Vite 8 + Tailwind CSS 4
- Firebase 12 (Auth + Firestore)
- react-router-dom v7
- @tanstack/react-table v8
- date-fns v4 (pt-BR)
- lucide-react (ícones)

## Arquitetura

### Rotas
- `/login` — público
- `/` — layout protegido (PrivateRoute)
  - `/` — Dashboard (KPIs)
  - `/orcamentos` — Orçamentos
  - `/projetos` — Projetos
  - `/calculos` — Cálculos
  - `/arquitetura` — Arquitetura
  - `/art` — Relatórios Técnicos (ART)
  - `/admin` — Admin (somente perfil "gestor")

### Autenticação
- Firebase Email/Password
- AuthContext (contexto global) com: user, perfil, loading, login(), logout(), resetSenha()
- PrivateRoute valida auth + role via `perfisPermitidos`
- Perfis: gestor, comercial, tecnico, controladoria

### Coleções Firestore
| Coleção | Descrição |
|---|---|
| `orcamentos` | Orçamentos/Propostas |
| `projetos` | Projetos em andamento |
| `calculos` | Cálculos técnicos |
| `arquitetura` | Documentos de arquitetura |
| `art` | Anotações de Responsabilidade Técnica |
| `usuarios` | Perfis de usuário com roles |

### Padrões de Status
- **Orçamentos:** PENDENTE, EM ANÁLISE, APROVAÇÃO CLIENTE, APROVADO, REPROVADO
- **Projetos:** PENDENTE, APROVAÇÃO CLIENTE, COMPATIBILIZAÇÃO, EM ANDAMENTO, CONCLUÍDO
- **ART:** PENDENTE, APROVAÇÃO RASCUNHO, AGENDADO FINANCEIRO, EMITIDA, FINALIZADO

## Estrutura de Arquivos

```
src/
├── App.jsx                    # Roteamento principal
├── main.jsx                   # Entry point
├── index.css                  # Tailwind + estilos globais
├── firebase/
│   ├── config.js              # Init Firebase, exporta auth + db
│   └── firestore.js           # CRUD wrapper: addDoc_(), updateDoc_(), deleteDoc_(), getAll(), getOne(), subscribe()
├── contexts/
│   └── AuthContext.jsx        # Provider de autenticação
├── components/
│   ├── Layout.jsx             # Sidebar + nav principal
│   ├── PrivateRoute.jsx       # Guard de auth + roles
│   ├── TabelaGenerica.jsx     # Tabela reutilizável (search, filtros, add/edit/delete)
│   ├── Modal.jsx              # Dialog wrapper
│   ├── ConfirmDialog.jsx      # Confirmação de ações
│   ├── PageHeader.jsx         # Cabeçalho de página
│   ├── StatusBadge.jsx        # Badge de status
│   ├── EmptyState.jsx         # UI de lista vazia
│   └── forms/
│       ├── ProjetoForm.jsx
│       ├── OrcamentoForm.jsx
│       ├── ARTForm.jsx
│       └── CalculoForm.jsx
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Orcamentos.jsx
│   ├── Projetos.jsx
│   ├── Calculos.jsx
│   ├── Arquitetura.jsx
│   ├── ART.jsx
│   └── Admin.jsx
└── data/
    └── dominios.js            # Enums/dropdowns estáticos
```

## Padrões de Código
- State management via React Context (sem Redux/Zustand)
- Real-time sync via Firestore `onSnapshot`
- Formulários controlados com estado local
- Formatação monetária em BRL
- Formatação de datas via date-fns pt-BR

## Firestore Rules
```
/usuarios/{uid}    — leitura: autenticados | escrita: próprio uid
/orcamentos        — leitura/escrita: autenticados
/projetos          — leitura/escrita: autenticados
/calculos          — leitura/escrita: autenticados
/arquitetura       — leitura/escrita: autenticados
/art               — leitura/escrita: autenticados
```

## Decisões Técnicas Relevantes
- 464 registros importados em produção
- TabelaGenerica é o componente central — todas as listagens passam por ela
- Sem TypeScript (JS puro com JSX)
- Deploy via Firebase Hosting

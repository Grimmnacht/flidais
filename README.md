# 🌳 Flidais - Sistema de Gestão Veterinária

**Flidais** é uma aplicação web completa voltada para a gestão de clínicas veterinárias. O sistema permite que profissionais da área gerenciem pacientes, tutores, agendamentos e prontuários clínicos de forma ágil, segura e imersiva.

Projeto desenvolvido como requisito de avaliação (Trabalho A3) para a disciplina de **Modelos, Métodos e Técnicas da Engenharia de Software**.

---

## 💻 Arquitetura e Engenharia de Software

O projeto foi construído sob uma arquitetura **Cliente-Servidor** fortemente desacoplada, priorizando manutenibilidade e escalabilidade, com desenvolvimento guiado por princípios de *Extreme Programming (XP)*.

### Backend (API REST)
Construído em **Node.js + Express**, o servidor atua como uma ponte segura para o banco de dados PostgreSQL (via Supabase). 
O sistema utiliza uma **Arquitetura Modular**, separando responsabilidades em:
- `/routes`: Módulos de rotas independentes (`auth`, `pacientes`, `agendamentos`, `protocolos`).
- `/middleware`: Interceptadores para validação de dados e tratamento global de erros.
- `db.js`: Camada exclusiva de persistência e comunicação com o Supabase.

### Frontend (SPA-like)
Desenvolvido com **HTML5, JavaScript Vanilla e Tailwind CSS**. A interface foi projetada com forte embasamento em UI/UX e Heurísticas de Nielsen (especialmente *Prevenção de Erros* e *Visibilidade do Status do Sistema*).
- **Shared Helpers**: Utilização de módulos compartilhados (`shared.js`, `theme.js`) para chamadas assíncronas (Fetch API) e feedback visual (Toast Notifications), garantindo o princípio DRY (Don't Repeat Yourself).

---

## 🚀 Principais Funcionalidades

- **Autenticação:** Sistema de login seguro para controle de acesso dos veterinários.
- **Dashboard Inteligente:** Painel principal com a agenda do dia. Inclui lógica de retenção de dados: agendamentos pendentes de dias anteriores permanecem visíveis até que sejam devidamente finalizados ou cancelados.
- **Gestão Integrada:** Cadastro simultâneo de Tutor, Paciente e Agendamento em um único fluxo otimizado.
- **Prontuário e Evolução Clínica:** Durante o atendimento, o veterinário pode selecionar Protocolos Pré-definidos (Templates) para agilizar o preenchimento da evolução.
- **Galeria de Pacientes:** Busca e listagem de todos os animais cadastrados, com modal dinâmico contendo a linha do tempo completa do histórico clínico.
- **Integração WhatsApp:** Envio automatizado do resumo do atendimento (evolução clínica e status) diretamente para o WhatsApp do tutor.

---

## 🛠️ Stack Tecnológica

| Componente | Tecnologia |
| :--- | :--- |
| **Backend** | Node.js, Express (5.x) |
| **Frontend** | HTML5, JavaScript (Vanilla ES6+), Tailwind CSS (via CDN) |
| **Banco de Dados** | PostgreSQL (Supabase / `@supabase/supabase-js`) |
| **Integração Externa** | WhatsApp Web API |

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18+ recomendado)
- Conta no [Supabase](https://supabase.com/) com as tabelas configuradas (Usuários, Tutores, Pacientes, Agendamentos, Protocolos).

### Passos para Instalação

1. Clone o repositório:
   
```bash
git clone https://github.com/Grimmnacht/flidais.git
cd flidais

```

2. Instale as dependências do servidor:
   
```bash
cd backend
npm install

```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz da pasta `backend` com as suas credenciais do Supabase:

```env
SUPABASE_URL=sua_url_aqui
SUPABASE_KEY=sua_anon_key_aqui
PORT=3000

```

4. Inicie o servidor:

```bash
npm start
# ou "node server.js"

```

5. Acesse a aplicação:
Abra o arquivo `frontend/index.html` diretamente em seu navegador.

---

# PowerUP Frontend

Frontend do projeto PowerUP desenvolvido com React, TypeScript, Vite e shadcn/ui.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Roteamento para aplicações React
- **Axios** - Cliente HTTP para requisições à API

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

## 🏃 Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🏗️ Build para Produção

Para criar o build de produção:

```bash
npm run build
```

Para visualizar o build:

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
POWER-UP-FRONTEND/
├── src/
│   ├── components/
│   │   └── ui/          # Componentes shadcn/ui
│   ├── lib/
│   │   └── utils.ts     # Utilitários
│   ├── pages/           # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Registro.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   └── api.ts       # Serviço de comunicação com API
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Ponto de entrada
│   └── index.css        # Estilos globais
├── public/              # Arquivos estáticos
└── package.json
```

## 🔌 Configuração da API

O frontend está configurado para se comunicar com o backend em:
- **URL Base**: `http://localhost:8080/api`

Para alterar a URL da API, edite o arquivo `src/services/api.ts`.

## 🎨 Componentes shadcn/ui

Os componentes utilizados são:
- **Button** - Botões estilizados
- **Input** - Campos de entrada
- **Label** - Rótulos para formulários
- **Card** - Cards para conteúdo

## 📝 Funcionalidades

### Autenticação
- ✅ Tela de Login
- ✅ Tela de Registro
- ✅ Validação de formulários
- ✅ Tratamento de erros
- ✅ Redirecionamento após login/registro

### Dashboard
- ✅ Página inicial após autenticação
- ✅ Logout

## 🔐 Endpoints Utilizados

- `POST /api/auth/login` - Autenticação de usuário
- `POST /api/auth/registro` - Registro de novo usuário

## 📄 Licença

Este projeto faz parte do PowerUP.

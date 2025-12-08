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
│   │   └── Perfil.tsx
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Ponto de entrada
│   └── index.css        # Estilos globais
├── public/              # Arquivos estáticos
└── package.json
```

## 🎨 Componentes shadcn/ui

Os componentes utilizados são:
- **Button** - Botões estilizados
- **Card** - Cards para conteúdo
- **Progress** - Barras de progresso
- **Badge** - Badges e tags
- **Avatar** - Avatar do usuário

## 📝 Funcionalidades

### Tela de Perfil
- ✅ Header com avatar, nome, nível e título
- ✅ Badges de conquistas
- ✅ Estatísticas (Total Treinos e XP Total)
- ✅ Abas de navegação (Estatísticas e Avatar)
- ✅ Atributos físicos com barras de progresso
- ✅ Conquistas recentes com ícones

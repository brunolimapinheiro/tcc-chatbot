# Chatbot IFPI AI

Bem-vindo ao Chatbot Iamy! Este projeto é um chatbot para WhatsApp desenvolvido com TypeScript, utilizando a biblioteca Baileys para conexão, a API Gemini para respostas de IA e MongoDB para gerenciamento de dados.

## Requisitos

Antes de iniciar o projeto, certifique-se de ter as seguintes ferramentas instaladas:

- Node.js (versão 18 ou superior)
- npm (gerenciador de pacotes do Node.js)

## Configuração das chaves de API

O projeto depende de duas chaves de API:

- **API Key do Gemini:** Para acessar a API de IA generativa.
- **API Key do MongoDB:** Para se conectar ao banco de dados.

Crie um arquivo `.env` na raiz do projeto e adicione as chaves da seguinte forma:

```
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=your_mongodb_connection_string_here
```

## Instalação das dependências

Instale as dependências do projeto executando o seguinte comando:

```bash
npm install
```

## Scripts disponíveis

No arquivo `package.json`, estão definidos alguns scripts para facilitar o desenvolvimento e a execução do projeto:

- **Iniciar o chatbot:**

```bash
npm start
```

- **Compilar o código TypeScript:**

```bash
npm run build
```

- **Copiar assets para a pasta de distribuição:**

```bash
npm run copy-assets
```

## Estrutura do Projeto

- `src/app/app.ts`: Arquivo principal de inicialização do chatbot.
- `src/information_ifpi/`: Diretório para arquivos informativos.
- `dist/`: Pasta onde o código compilado será gerado.

## Tecnologias utilizadas

- **Linguagem:** TypeScript
- **Bibliotecas principais:**
  - Baileys para conexão com WhatsApp
  - API Gemini para respostas de IA
  - Mongoose para modelagem do MongoDB
  - pg-promise para conexão com PostgreSQL (caso precise)

## Contribuição

Se quiser contribuir com o projeto, sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a licença ISC.

---

Agora é só configurar as chaves, instalar as dependências e começar a rodar o chatbot! 🚀

Se precisar de ajustes ou quiser personalizar mais o README, é só avisar! 😉


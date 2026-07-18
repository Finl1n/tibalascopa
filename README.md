# tibalascopa

Plataforma web para acompanhar Copa, jogos, jogadores e fatos historicos com uma interface editorial e um agente de IA para perguntas livres.

## Objetivo

- mostrar dados reais sem depender do chat
- permitir perguntas ao agente com contexto da competicao
- exibir jogos, selecoes, jogadores e fatos historicos em uma home premium
- manter a base pronta para crescer alem da Copa

## Fonte de dados

O projeto usa a API gratuita do TheSportsDB.

- base v1: `https://www.thesportsdb.com/api/v1/json`
- chave gratuita: `123`
- rotas principais usadas no projeto:
  - `searchteams.php`
  - `lookupteam.php`
  - `searchplayers.php`
  - `lookupplayer.php`
  - `lookup_all_players.php`
  - `lookupleague.php`
  - `lookuptable.php`
  - `search_all_seasons.php`
  - `eventsnextleague.php`
  - `eventspastleague.php`

## Catalogo local

Para evitar depender da API em todas as telas e para preparar o agente com base real, o projeto gera um catalogo local sincronizado a partir da TheSportsDB.

- comando de sincronizacao: `npm run sync:cup`
- arquivo gerado: `data/catalog/world-cup/catalog.json`
- rota interna: `/api/football/catalog`
- a base local e real, nao mockada

## Agente de IA

O agente responde com ajuda de IA quando `OPENAI_API_KEY` estiver configurada.

- modelo padrao: `gpt-5.6-terra`
- rota do agente: `/api/football/agent`
- integracao oficial: Responses API da OpenAI
- sem chave, o projeto usa fallback local com os mesmos dados reais

## Estrutura

- `app/` paginas e rotas do Next.js
- `components/` blocos de interface
- `lib/` camada de integracao com a API
- `data/` conteudos editoriais e regras internas
- `docs/` documentacao do projeto
- `public/` assets visuais

## Fluxo

1. a interface chama a camada de dados
2. a camada de dados consulta TheSportsDB
3. os dados sao normalizados antes de ir para a UI
4. o agente usa a mesma base para responder perguntas

## Proximo passo

- sincronizar o catalogo completo da Copa
- ligar o agente ao catalogo local
- ampliar a cobertura para outras competicoes

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

- ampliar a cobertura de ligas
- ligar o agente ao contexto dos dados reais
- preparar o deploy e o versionamento no GitHub

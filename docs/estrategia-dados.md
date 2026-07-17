# Estrategia de Dados

## Direcao

O tibalascopa vai consumir dados reais da API gratuita do TheSportsDB e manter conteudos editoriais internos apenas para contexto, curadoria e narrativa visual.

## Fonte principal

- TheSportsDB v1
- chave gratuita `123`
- uso de cache leve no servidor para reduzir chamadas repetidas
- sincronizacao local do catalogo com dados reais para alimentar a interface e o agente

## O que vem da API

- jogos
- selecoes
- jogadores
- tabelas
- temporadas
- eventos recentes e proximos
- imagem e badges quando disponiveis

## O que fica interno

- regras de exibicao
- textos de experiencia
- perguntas iniciais do agente
- fatos editoriais quando a API nao trouxer um dado especifico

## Regra do agente

O agente nunca deve inventar estatistica. Se o dado nao estiver na base, a resposta precisa deixar isso claro.
Quando a chave `OPENAI_API_KEY` estiver disponivel, a IA reescreve a resposta a partir do contexto real; sem chave, o fallback local permanece ativo.

## Decisao atual

TheSportsDB free e a fonte oficial do MVP.

## Sincronizacao

- `npm run sync:cup` gera o catalogo local real
- a saida fica em `data/catalog/world-cup/catalog.json`
- a rota interna `/api/football/catalog` expoe o catalogo para consumo do app e dos agentes

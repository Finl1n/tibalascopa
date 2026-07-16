# Stack e Arquitetura

## Stack atual

- Next.js
- TypeScript
- CSS global com design editorial
- TheSportsDB free como fonte de dados
- GitHub para versionamento

## Arquitetura inicial

1. interface web
2. camada de integracao com TheSportsDB
3. rotas internas para contrato e reuso
4. camada do agente de IA
5. persistencia futura

## Criticos

- manter separacao entre dados e UI
- nao inventar estatistica
- priorizar resposta rapida com cache
- documentar cada decisao tecnica

## Estrutura

- `app/` paginas e rotas
- `components/` UI
- `lib/` integracao e utilitarios
- `data/` conteudos editoriais
- `docs/` documentacao

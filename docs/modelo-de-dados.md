# Modelo de Dados

## Entidades principais

### Competition

- id
- name
- year
- edition
- status

### Team

- id
- name
- code
- badgeUrl
- group

### Player

- id
- name
- teamId
- position
- shirtNumber
- photoUrl

### Match

- id
- competitionId
- homeTeamId
- awayTeamId
- date
- status
- homeScore
- awayScore
- venue

### HistoricalFact

- id
- competitionYear
- title
- description
- category
- source

### AgentQuestion

- id
- question
- contextType
- createdAt

### AgentAnswer

- id
- questionId
- answer
- confidence
- sources

## Relacoes

- uma competicao possui varios jogos
- uma selecao possui varios jogadores
- um jogo pode ter varios eventos
- um fato historico pertence a uma edicao
- uma pergunta pode gerar uma resposta rastreavel

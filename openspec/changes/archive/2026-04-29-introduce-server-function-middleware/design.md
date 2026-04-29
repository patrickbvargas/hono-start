## Context

As server functions já são o boundary principal de leitura e escrita no app. O próximo passo natural é centralizar concerns transversais repetíveis antes do handler de feature, principalmente autenticação protegida e contexto derivado de sessão.

TanStack Start oferece middleware composável para esse caso. O change é arquitetural, mas pode ser introduzido incrementalmente, começando por um middleware protegido canônico e deixando migração total para etapas futuras.

## Goals / Non-Goals

**Goals:**
- Criar um padrão compartilhado para autenticar e enriquecer server functions protegidas.
- Reduzir repetição de wiring de sessão por feature.
- Manter lógica de domínio dentro das features.

**Non-Goals:**
- Migrar todas as functions em massa no primeiro passo.
- Criar middleware genérico demais que esconda erros de domínio.
- Alterar payloads públicos das feature APIs sem necessidade.

## Decisions

### 1. Middleware será usado apenas para concerns transversais
O middleware canônico cuidará de autenticação protegida e contexto compartilhado. Regras de negócio, mensagens pt-BR e decisões de feature continuam nos handlers locais.

Rationale:
- Evita camada “mágica” com domínio indevido.
- Mantém fronteiras já documentadas entre shared e feature.

Alternatives considered:
- Continuar com helpers manuais em cada handler: simples, mas mais repetitivo.
- Criar wrapper custom fora do mecanismo nativo do Start: menos alinhado à stack.

### 2. Introdução será incremental
O projeto começará com um middleware protegido reutilizável e migrará gradualmente as server functions mais adequadas.

Rationale:
- Menor risco operacional.
- Permite validar ergonomia antes de adoção ampla.

### 3. Contexto autenticado deve continuar derivando da sessão canônica
O middleware usará os helpers compartilhados de sessão existentes para resolver o ator autenticado e escopo de firma.

Rationale:
- Não cria uma segunda política de auth.
- Preserva decisões multi-tenant já consolidadas.

## Risks / Trade-offs

- [Middleware abstrair demais e esconder comportamento] → Limitar escopo a concerns realmente compartilhados.
- [Adoção parcial gerar dois padrões por um tempo] → Documentar middleware como caminho preferido para novas functions protegidas.
- [Migração quebrar testes de handler] → Atualizar testes de server boundary conforme cada function migrada.

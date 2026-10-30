# Pessoas — evidência de implementação em 30/10/2026

Rota `/pessoas` substitui as rotas de clientes e colaboradores. CRUD inclui criação, edição, exclusão lógica e restauração, filtros e papéis cumulativos. Mantém componentes e layout existentes. Dados profissionais ficam na Visão geral, apenas para colaborador autorizado. Histórico reutiliza a tabela `EntityAuditHistory`, menu de contexto, drawer e página de auditoria.

## Banco e seed

Aplicadas as migrations `20261030120000_person_role_profiles`, `20261030123000_person_profile_dates` e `20261030124500_counterparty_profile_trigger`. ClientProfile/SupplierProfile têm identidade própria; flags são derivadas dos perfis ativos. Colaborador exige fornecedor da mesma pessoa. Contratos/recebíveis referenciam ClientProfile; despesas/pagáveis, SupplierProfile. Clerk e atores continuam vinculados a Person.

Seed executado duas vezes sem reset e sem duplicar movimentos. Existem os genéricos Pagamentos diversos e Recebimentos diversos, sem documento, com perfil contextual. Verificação de banco: sete cenários de Pessoa e onze financeiros passaram, incluindo IDs distintos de pessoa/perfil, constraints, rollback e RLS. Prisma validate, geração do client, typecheck do seed e comparação schema/banco passaram. Upload e leitura dos cinco anexos privados do seed foram verificados. Upload pelo formulário não foi concluído na validação visual.

## Interface e verificações

Validado no navegador, com Admin autenticado: criar pessoa com múltiplos papéis, editar dados/percentuais, excluir, filtrar excluídos e restaurar. Cadastro de teste1004 preservado ativo. Confirmados bloco profissional na Visão geral, tabela de histórico, menu de contexto e resumo carregado no drawer.

Suíte focada Pessoas/auditoria/sessão: **141 testes passaram em16 arquivos**. Biome dos arquivos do ajuste de histórico e Pessoas passou. Nenhum erro de typecheck foi identificado nesses arquivos novos; o typecheck global ainda falha nos módulos legados que referenciam modelos financeiros/clientes/colaboradores removidos na etapa anterior. Não houve supressão desses erros.

Esta evidência não conclui a migração financeira nem todos os gates de finance-01. Rotas e consultas legadas dos outros módulos ainda precisam ser migradas nas propostas seguintes. Não foi executado db:reset nem alterada configuração externa de Clerk nesta etapa.

Build final de produção passou após a restauração do histórico.

## Ajustes posteriores de interface e catálogo

Removida somente a coluna Contratos da tabela geral de Pessoas. Adicionado o título Dados da pessoa no formulário e seu estado de carregamento. Catálogo de funções simplificado para as oito opções de LOOKUP_VALUES.md; Funcionário foi incorporado a Outro. Seed reaplicado com sucesso e vínculos STAFF convertidos para OTHER antes da retirada do item antigo. Quantidades de movimentos financeiros e invariantes permaneceram estáveis. Typecheck específico do Prisma/seed passou após o ajuste. Não houve alteração de grants por função.

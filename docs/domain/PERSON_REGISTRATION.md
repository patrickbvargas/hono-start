# Pessoas — revisão aprovada em 30/10/2026

Este contrato substitui a decisão de 29/10 de manter Clientes, Fornecedores e Colaboradores como telas/itens separados. Define o alvo; não afirma que as mudanças já foram implementadas. Preservar os componentes e estilo visual existentes.

## Identidade, papéis e extensões

Person é a entidade principal/global. Formulário com checkboxes de papéis acumuláveis: Cliente, Fornecedor e Colaborador. Esses booleanos na API/form são projeções da existência/atividade dos perfis correspondentes, não flags persistidas independentes. Filtro da rota única `/pessoas` usa o rótulo **Papéis**; PersonType continua significando pessoa física/jurídica. Valores dentro do filtro combinam por OR, demais filtros por AND, seguindo padrões de URL/tabela existentes.

Colaborador implica Fornecedor: marcar Colaborador marca Fornecedor e informa isso no formulário; bloquear remoção do papel Fornecedor enquanto Colaborador estiver marcado. Validar também no servidor e banco, não apenas na UI. Papéis/perfis não concedem login ou permissões.

Criar **ClientProfile, SupplierProfile e EmployeeProfile agora**, cada um opcional 1:1 em relação a Person, com personId único e FK obrigatória. Esses perfis não duplicam nome, documento, contatos ou anexos da identidade. ClientProfile/SupplierProfile têm função estrutural desde já: garantir elegibilidade nas FKs operacionais/financeiras. EmployeeProfile concentra tipo profissional, OAB aplicável e percentuais e é obrigatório para colaborador/conta protegida. Não transformar papéis em enum exclusivo.

Fonte única do papel: perfil ativo. Checkboxes criam/ativam os perfis na mesma transação; não usar sincronização eventual nem manter isCustomer/isSupplier/isEmployee persistidos como segunda verdade. Caso a migração preserve flags temporariamente, restrições devem garantir equivalência e uma etapa explícita deve removê-las. Criar/ativar EmployeeProfile exige SupplierProfile ativo da mesma Person atomicamente; integridade também no banco. IDs de perfil e Person são distintos: converter explicitamente, nunca reinterpretar números.

## Contrapartes dos títulos

Contract.customerId e Receivable.debtorId passam a referenciar **ClientProfile**; Expense.supplierId e Payable.beneficiaryId passam a referenciar **SupplierProfile** (nomes de campos podem ser explicitados como clientProfileId/supplierProfileId na implementação). Cada perfil resolve a Person correspondente. Inclusive funcionário, profissional autônomo ou remuneração automática de contrato usa SupplierProfile no pagar. Sessão/ator/anexos da identidade continuam referenciando Person; ContractAssignment continua EmployeeProfile. Valores de pessoa em filtros/projeções continuam resolvidos sem duplicação. Aplicar em seleção, criação, geração, extras e troca autorizada de contraparte; verificar novamente no servidor/banco. O perfil e participação exatos continuam obrigatórios na remuneração automática. Corrigir os seeds de colaboradores para também possuírem SupplierProfile. A integridade da remuneração compara Person do EmployeeProfile com Person do SupplierProfile beneficiário, não seus IDs de perfil.

Perfis têm ciclo de vida ativo/inativo sem apagar identidade. FK RESTRICT preserva contratos/títulos históricos; referências existentes impedem remoção física. Não desativar SupplierProfile enquanto EmployeeProfile ativo depende dele. Não remover/desativar papel exigido por obrigações pendentes nem alterar o histórico para viabilizar remoção. Perfis inativos não podem originar novas obrigações, mas histórico e baixas autorizadas de títulos existentes permanecem acessíveis. Inatividade/cancelamento de origem não deve impedir baixa autorizada de título válido já criado. Papéis comerciais não substituem permissões, filial ou sigilo.

## Pessoas genéricas do seed

Permitir cadastros consolidados identificados por `isGeneric` (alvo, default false). Seed cria deterministicamente **Pagamentos diversos** (Fornecedor) e **Recebimentos diversos** (Cliente), globais, sem CPF/CNPJ, sem EmployeeProfile, sem login e sem participação em equipe. Não são indivíduos fictícios. Analítica obrigatória categoriza cada título; notes/histórico explica o lançamento. Saldo pertence ao cadastro consolidado, não aos indivíduos subjacentes.

Documento aceita null no armazenamento. Pessoa comum continua com CPF/CNPJ obrigatório, normalizado, válido e único quando preenchido. Exceção de ausência é restrita à pessoa marcada genérica; nunca usar número fictício ou string vazia para satisfazer unicidade. Genérico não pode ser Colaborador nem ter EmployeeProfile/conta protegida. Pessoa física/jurídica não deve ser inventada para um agrupamento: permitir PersonType ausente no genérico, mantendo-o obrigatório e compatível com documento em pessoa comum; não criar um terceiro tipo fiscal fictício.

A necessidade atual é prover os dois genéricos pelo seed; não exige um fluxo para usuários criarem genéricos livremente. Nunca isentar qualquer Pessoa do documento por nome ou ID mágico. Seed usa chaves técnicas estáveis/únicas para esses registros sem documento, em vez de upsert por document=null ou busca só por nome. Manter tipo genérico identificável para futura política restritiva sem redesenhar finanças. Não implementar painel de configuração ou proibição adicional agora.

## Rota única e acesso

Sidebar Cadastros → **Pessoas**, com filtros por papel e formulário contextual. A rota unificada não entrega cadastro completo a Member. Member vê apenas pessoas-clientes dentro de contratos atribuídos e não administra fornecedores/colaboradores. Ocultar filtros/opções não autorizados; servidor filtra antes de contagens/opções/exportação e omite papéis adicionais, perfil profissional, percentuais, dados de acesso e vínculos protegidos da mesma Pessoa. Preservar dados de equipe já permitidos no contrato e própria remuneração, sem abrir diretório profissional.

Admin usa grants explícitos. Uma rota única não combina permissões `people`, `clients`, `suppliers` e `employees` numa autorização geral: reads/updates são contextuais e alterações em perfil/roles protegidos exigem as permissões correspondentes. Não ampliar grants de Member para fazer a tela funcionar; revisar projeção/política após Prisma e seed. Login Clerk continua pessoa real não genérica com perfil ativo.

## Ordem de execução e revisão histórica inicial

1. Corrigir Prisma, constraints/migrações, seed e verificações de banco para estas regras.
2. Validar fixtures, documento null dos dois genéricos, colaboradores-fornecedores, contrapartes válidas e reset reproduzível no desenvolvimento autorizado.
3. Depois revisar Clerk/sessão/grants conforme os novos contratos, preservando Admin/Member e bloqueios por campo/registro.
4. Adaptar API/UI da rota Pessoas e demais fluxos. Não afirmar app utilizável antes dos gates finais.

Revisão read-only dos commits em 30/10: `8c0718b` criou schema/seed financeiro; `d0cb812` vinculou Clerk a Person/EmployeeProfile e separou grants financeiros. Person.document e personTypeId ainda são obrigatórios, não há isGeneric; seed inicial usa isSupplier somente para alguns colaboradores e o fixture Person1000 não marca Fornecedor. Os genéricos não existem no seed. Não há evidência de checks de papéis financeiros nessas migrações. Novos ajustes estão pendentes; evidências dos commits anteriores continuam históricas, não prova destas regras. Esta revisão documental não executa migrations/reset nem muda Clerk.

## Expansão futura — sem implementar agora

Dados bancários, endereços, vínculos/grupo familiar e outros domínios poderão ser entidades relacionadas a Person, reutilizáveis pelos papéis conforme autorização. Não criar tabelas/campos/UI para esses módulos nesta etapa. Não concentrar futuros dados repetíveis em colunas genéricas ou duplicá-los em cada perfil.

## Delta sobre o código revisado inicialmente

Além das pendências acima, o schema atual ainda não possui ClientProfile/SupplierProfile e as FKs citadas apontam para Person. Implementação deve criar perfis a partir dos papéis existentes, remapear FKs/seed/filtros/beneficiário da remuneração e revisar políticas que atualmente comparam beneficiaryId diretamente com personId. Clerk personId continua identidade Person; nunca trocar por ID de SupplierProfile. Esta é decisão de desenho aprovada; schema/migração permanecem pendentes nesta revisão documental.

## Detalhes da pessoa

Na listagem geral de Pessoas, não exibir a coluna Contratos. Preservar as demais colunas, filtros e ações. O formulário identifica o bloco de identidade/contato/ativo com o título Dados da pessoa, seguindo FormSection dos demais formulários.

Colaborador possui uma função do catálogo global EmployeeType: Advogado, Coordenador, Gerente, Contador, Assistente Jurídico, Auxiliar Administrativo, Estagiário ou Outro. Outro inclui funcionário sem função específica. Função é distinta dos papéis Cliente/Fornecedor/Colaborador e das roles Admin/Member do Clerk; não concede acesso automaticamente. OAB é obrigatória apenas para Advogado. O seed converte vínculos do antigo STAFF para OTHER e preserva os demais IDs e vínculos.

Dados profissionais aparecem como bloco na aba Visão geral, somente para pessoa com papel Colaborador e leitura profissional autorizada. Não existe aba separada de Dados profissionais. Manter Visão geral, Financeiro, Contato, Anexos e Histórico conforme permissões, sem redesenhar layout. URLs antigas com tab=professional usam o fallback Visão geral.

Histórico deve reutilizar EntityAuditHistory: tabela original, menu de contexto, abertura do resumo em drawer e página da auditoria. Não substituir por cards/blocos nem criar uma UI própria de histórico. Adequar apenas consultas, escopo e identidade Person, preservando payload de antes/depois auditável.

## Estado atual da implementação

Perfis, constraints, genéricos do seed, sessão e CRUD Pessoas foram implementados após a revisão histórica acima. Ver [evidências e limites](../implementation/PERSON_IMPLEMENTATION.md). As pendências citadas na revisão inicial descrevem o ponto de partida, não o schema atual. Migração dos demais módulos permanece pendente.

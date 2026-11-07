# User Flows — Canonical Workflows

Este documento descreve os fluxos de usuário canônicos do sistema.

---

## 1. Cadastro e Gestão de Pessoas (`/pessoas`)

1. O usuário acessa a listagem unificada em **Cadastros → Pessoas**.
2. Abre o formulário de nova pessoa ou edição.
3. Informa nome, documento (CPF/CNPJ) e contatos.
4. Seleciona os papéis aplicáveis através dos checkboxes:
   - **Cliente**: Cria/ativa o `ClientProfile`. Habilita a pessoa para contratos e recebimentos.
   - **Fornecedor**: Cria/ativa o `SupplierProfile`. Habilita a pessoa para despesas e pagamentos.
   - **Colaborador**: Cria/ativa o `EmployeeProfile`. Exige função (`EmployeeType`), OAB (obrigatória para advogados) e percentuais de comissão.
   - *Regra*: Marcar **Colaborador** marca automaticamente **Fornecedor** e impede sua remoção enquanto o colaborador estiver ativo.
5. Salva o formulário. O sistema cria/atualiza a `Person` e os perfis numa única transação atômica.
6. Acesso por perfil: Usuário `Member` só visualiza clientes com contratos atribuídos a ele. Não tem acesso a colaboradores nem fornecedores.

---

## 2. Contratos e Planos de Receita (`/contratos`)

1. O usuário acessa a listagem de **Contratos** e clica em novo contrato.
2. Seleciona o cliente (filtrado por pessoas com `ClientProfile` ativo).
3. Informa número do processo, área jurídica, percentual de honorários contratuais e observações.
4. Adiciona a equipe do contrato (`ContractAssignment`):
   - Seleciona colaboradores com `EmployeeProfile` ativo.
   - Define o tipo de atuação (ex: Responsável, Indicante, Indicado).
5. Adiciona os planos de receita (`Revenue`):
   - Informa tipo de receita (Administrativo, Judicial, Sucumbência) e valor negociado.
6. Salva o contrato com sua equipe e receitas.

---

## 3. Acerto Financeiro de Contrato (Geração de Títulos)

Os cards financeiros de receitas e despesas exibem um chip no cabeçalho para usuários autorizados a ler os respectivos títulos: **Quitado** quando há títulos ativos e nenhum saldo de principal; **Em atraso** quando existe título com saldo e vencimento anterior à data atual em São Paulo; **Pendente** nos demais casos, inclusive antes da geração e em pagamentos parciais sem atraso. Entrada participa da situação agregada. Pagamentos estornados e títulos cancelados não compõem a quitação; juros e descontos não substituem o principal abatido no cálculo do saldo.

1. No detalhe do contrato ou da receita, o operador solicita o **Acerto Financeiro**.
2. O sistema herda o valor acordado da `Revenue`.
3. O operador informa:
   - Valor de entrada (opcional) e seu vencimento.
   - Quantidade de parcelas e primeiro vencimento das parcelas.
   - Analítica contábil e forma esperada de pagamento.
4. O sistema gera uma prévia editável na tela.
5. O operador pode ajustar valores e vencimentos individuais na prévia.
6. **Validação**: A soma exata de todos os títulos da prévia deve igualar o valor negociado em centavos.
7. O operador confirma. O sistema grava atomicamente:
   - Os títulos na tabela `receivables` (devedor = cliente do contrato).
   - Os vínculos na tabela de ponte `contract_revenue_receivables`.
   - O registro imutável no `audit_logs`.

---

## 4. Despesas Operacionais (`/despesas`)

1. O operador financeiro acessa **Despesas** e inicia o cadastro.
2. Seleciona o fornecedor (`SupplierProfile` ativo), informa valor negociado, data prevista e observações.
3. Na aba **Financeiro** da despesa, clica em **Gerar parcelas**. O fluxo segue o mesmo padrão visual e formulário do acerto de receitas de contratos:
   - Informa entrada opcional, quantidade de parcelas, vencimentos, categoria financeira e forma de pagamento prevista.
   - A prévia atualiza automaticamente e permite ajustar os títulos individualmente.
4. Ao confirmar o parcelamento da despesa:
   - O sistema valida a soma dos títulos com o valor da despesa.
   - Grava os títulos na tabela `payables` (beneficiário = fornecedor).
   - Grava os vínculos na tabela de ponte `expense_payables`.
5. Após gerar, a aba exibe o acerto como **Títulos gerados**, sem permitir nova geração. Usuários autorizados a ler títulos a pagar visualizam pago, saldo a pagar e **Ver parcelas**, incluindo entrada e títulos extras.
   - O saldo considera o principal abatido por pagamentos não estornados; o valor pago representa o caixa efetivo.
   - Títulos cancelados permanecem visíveis, sem compor o saldo a pagar. Alterar ou excluir a despesa não reescreve as dívidas geradas.

---

## 5. Lançamentos Manuais Diretos no Financeiro

1. O operador acessa a tela de **Contas a Receber** ou **Contas a Pagar**.
2. Clica em **Novo Título Manual**:
   - Informa contraparte (`ClientProfile` no receber ou `SupplierProfile` no pagar).
   - Informa valor, vencimento, analítica, meio de pagamento previsto e justificativa (`notes`).
3. Ao salvar, o sistema grava o título diretamente em `receivables` ou `payables` sem criar registros em nenhuma tabela de ponte.

---

## 6. Baixa de Recebível e Motor de Remuneração

1. O operador acessa **Contas a Receber** e seleciona 1 ou mais títulos da mesma filial.
2. Clica em **Registrar Recebimento**:
   - Informa data efetiva (hoje ou passada) e meio de pagamento real.
   - Define principal abatido $P$, desconto $D$, juros $J$ e multa $M$.
   - Marca se deseja **Gerar Remunerações** (habilitado por padrão em títulos contratuais).
3. Ao confirmar:
   - O sistema grava um `Receipt` para cada título selecionado.
   - Abate o saldo devedor do `Receivable`.
   - Se for título de contrato e remuneração ativa: avalia a equipe em `ContractAssignment`, calcula o percentual sobre o caixa efetivo $C = P - D + J + M$, calcula o vencimento pela régua da filial, grava a ponte `remuneration_payables` e gera a duplicata `Payable` para o colaborador.

---

## 7. Baixa de Pagável (Pagamento de Fornecedor / Colaborador)

1. O operador acessa **Contas a Pagar** e seleciona os títulos que deseja quitar (inclusive remunerações da equipe).
2. Clica em **Registrar Pagamento**:
   - Informa data efetiva e meio de pagamento real.
   - Define principal abatido, descontos e encargos.
3. Ao confirmar, o sistema grava um `Payment` para cada título selecionado e abate seus saldos.

---

## 8. Estorno de Liquidação (Reversão)

1. O operador abre o detalhe da baixa que deseja cancelar e clica em **Estornar**.
2. Informa o motivo obrigatório do estorno.
3. O sistema valida dependências:
   - Se for baixa a receber que gerou remunerações e alguma delas já foi paga: **bloqueia o estorno**.
   - Se nenhuma remuneração foi paga: cancela os títulos de remuneração gerados, grava o `ReceiptReversal` ou `PaymentReversal` e reabre o saldo do título original.

## 9. Consulta de Contas a Receber

O operador acessa Contas a receber e filtra títulos por devedor, contrato, origem, classificação, situação, vencimento, analítica e meio previsto. Busca, ordenação e paginação permanecem na URL. Desktop oferece tabela ou cards; mobile utiliza cards e menus de ações. Totais representam todo o resultado filtrado autorizado.

A ação principal abre a página dedicada; menus de ações e contexto oferecem Abrir página e Ver resumo. O resumo abre em drawer sem perder a lista. A página mantém abas Visão geral, Recebimentos, Anexos e Histórico conforme permissões, e retorna aos filtros anteriores. Nesta etapa, a coleção é somente consulta, sem criação, edição, cancelamento, baixa ou estorno. Anexos do título são consultáveis sem upload ou exclusão.

Em atraso prevalece visualmente sobre Parcial, mas títulos parcialmente recebidos e vencidos atendem ambos os filtros. Principal abatido e caixa recebido são campos distintos. Estornos preservam o evento original e recompõem o saldo. Encerramento ou exclusão operacional do contrato não remove a obrigação financeira.

## 10. Consulta de Contas a Pagar

Contas a pagar segue a coleção de Contas a receber: tabela/cards, busca, filtros e chips na URL, atalhos de vencimento, ordenação, paginação e totais filtrados. Filtra por beneficiário, contrato da remuneração, origem (Despesa, Remuneração ou Direto), classificação, situação, analítica e meio previsto.

A ação principal abre a página dedicada; menus oferecem Abrir página e Ver resumo. Resumo usa drawer compacto; página mantém Visão geral, Pagamentos, Anexos e Histórico conforme permissões, preservando contexto no retorno. Nesta etapa a coleção é somente consulta, sem criação, edição, cancelamento, baixa ou estorno; anexos também são somente leitura.

Admin consulta a filial ativa. Member com grant explícito consulta apenas remuneração cujo beneficiário é sua própria Person e cujo contrato está atribuído a ele. Essa seleção precede opções, contagens e totais; pagamentos exigem grant próprio e o mesmo escopo. Exclusão operacional não apaga títulos. Principal abatido e caixa pago permanecem distintos e desconsideram pagamentos estornados.

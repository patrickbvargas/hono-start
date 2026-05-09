import * as React from "react";
import { AttachmentSection } from "@/features/attachments";
import { EntityActions } from "@/shared/components/entity-actions";
import {
  type DetailFieldItem,
  EntityDetail,
} from "@/shared/components/entity-detail";
import { EntityStatus } from "@/shared/components/entity-status";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DrawerClose,
} from "@/shared/components/ui";
import { formatter } from "@/shared/lib/formatter";
import { toast } from "@/shared/lib/toast";
import type { EntityId } from "@/shared/schemas/entity";
import type { OverlayState } from "@/shared/types/overlay";
import { useEmployee } from "../../hooks/use-data";
import { useEmployeeGrantAccess } from "../../hooks/use-grant-access";
import { useEmployeeResetPassword } from "../../hooks/use-reset-password";
import { useEmployeeRevokeAccess } from "../../hooks/use-revoke-access";
import { getEmployeeLifecycleActions } from "../../utils/lifecycle-actions";
import { TemporaryPasswordDialog } from "../temporary-password";

interface EmployeeDetailsProps {
  canManageLifecycle?: boolean;
  id: EntityId;
  onDelete?: (id: EntityId) => void;
  onEdit?: (id: EntityId) => void;
  onRestore?: (id: EntityId) => void;
  state: OverlayState;
}

interface TemporaryPasswordState {
  context: "grant" | "reset";
  value: string;
}

export const EmployeeDetails = ({
  canManageLifecycle = false,
  id,
  onDelete,
  onEdit,
  onRestore,
  state,
}: EmployeeDetailsProps) => {
  const [temporaryPassword, setTemporaryPassword] =
    React.useState<TemporaryPasswordState | null>(null);

  return (
    <EntityDetail.Root key={id} state={state}>
      <React.Suspense fallback={<EmployeeDetailsFallback />}>
        <EmployeeDetailsContent
          canManageLifecycle={canManageLifecycle}
          id={id}
          onDelete={onDelete}
          onEdit={onEdit}
          onRestore={onRestore}
          onTemporaryPasswordChange={setTemporaryPassword}
          temporaryPassword={temporaryPassword}
        />
      </React.Suspense>
    </EntityDetail.Root>
  );
};

interface EmployeeDetailsContentProps {
  canManageLifecycle: boolean;
  id: EntityId;
  onDelete?: (id: EntityId) => void;
  onEdit?: (id: EntityId) => void;
  onRestore?: (id: EntityId) => void;
  onTemporaryPasswordChange: (value: TemporaryPasswordState | null) => void;
  temporaryPassword: TemporaryPasswordState | null;
}

const EmployeeDetailsContent = ({
  canManageLifecycle,
  id,
  onDelete,
  onEdit,
  onRestore,
  onTemporaryPasswordChange,
  temporaryPassword,
}: EmployeeDetailsContentProps) => {
  const { employee } = useEmployee(id);
  const actions = getEmployeeLifecycleActions({
    canManageLifecycle,
    isSoftDeleted: employee.isSoftDeleted,
  });
  const [isGrantDialogOpen, setIsGrantDialogOpen] = React.useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = React.useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false);

  const { handleConfirm: handleGrantAccess, isPending: isGrantPending } =
    useEmployeeGrantAccess();
  const { handleConfirm: handleRevokeAccess, isPending: isRevokePending } =
    useEmployeeRevokeAccess();
  const {
    handleConfirm: handleResetPasswordConfirm,
    isPending: isResetPending,
  } = useEmployeeResetPassword();

  const canManageAccess = !employee.isSoftDeleted && canManageLifecycle;
  const hasEnabledAccess =
    employee.hasCredentialAccount && employee.isAccessEnabled;
  const canGrantAccess =
    canManageAccess && employee.isActive && !hasEnabledAccess;
  const canResetPassword = canManageAccess && hasEnabledAccess;
  const canRevokeAccess = canManageAccess && hasEnabledAccess;
  const isGrantPasswordVisible = temporaryPassword?.context === "grant";

  const generalInfo = React.useMemo<DetailFieldItem[]>(
    () => [
      { term: "OAB", definition: formatter.oab(employee.oabNumber) },
      { term: "Cargo", definition: employee.type },
      { term: "Perfil", definition: employee.role },
      { term: "Contratos", definition: employee.contractCount },
    ],
    [employee],
  );

  const contactInfo = React.useMemo<DetailFieldItem[]>(
    () => [{ term: "Email", definition: employee.email }],
    [employee],
  );

  const accessInfo = React.useMemo<DetailFieldItem[]>(
    () => [
      {
        term: "Acesso ao sistema",
        definition: hasEnabledAccess
          ? "Ativo"
          : employee.hasCredentialAccount
            ? "Revogado"
            : "Não concedido",
      },
      {
        term: "Troca obrigatória",
        definition: employee.mustChangePassword ? "Pendente" : "Não",
      },
    ],
    [employee, hasEnabledAccess],
  );

  const financialInfo = React.useMemo<DetailFieldItem[]>(
    () => [
      {
        term: "Remuneração",
        definition: formatter.percent(employee.remunerationPercent),
      },
    ],
    [employee],
  );

  const registerInfo = React.useMemo<DetailFieldItem[]>(
    () => [
      {
        term: "Status",
        definition: (
          <EntityStatus
            isActive={employee.isActive}
            isSoftDeleted={employee.isSoftDeleted}
          />
        ),
      },
      { term: "Criado em", definition: formatter.date(employee.createdAt) },
    ],
    [employee],
  );

  const handleGrantAccessClick = async () => {
    const password = await handleGrantAccess(id);

    if (password) {
      onTemporaryPasswordChange({
        context: "grant",
        value: password,
      });
    }
  };

  const handleResetPassword = async () => {
    const password = await handleResetPasswordConfirm(id);

    if (password) {
      onTemporaryPasswordChange({
        context: "reset",
        value: password,
      });
    }
  };

  const handleRevokeAccessClick = async () => {
    const success = await handleRevokeAccess(id);

    if (success) {
      setIsRevokeDialogOpen(false);
      onTemporaryPasswordChange(null);
    }
  };

  const handleTemporaryPasswordChange = (isOpen: boolean) => {
    if (!isOpen) {
      onTemporaryPasswordChange(null);
    }
  };

  const handleCopyPassword = async () => {
    if (!temporaryPassword?.value || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(temporaryPassword.value);
    toast.success("Senha temporária copiada.");
  };

  return (
    <EntityDetail.Content>
      <EntityDetail.Header className="flex-row items-center justify-between gap-3">
        <EntityDetail.Title>{employee.fullName}</EntityDetail.Title>
        <EntityActions
          canView={false}
          canEdit={actions.canEdit}
          canRestore={actions.canRestore}
          canDelete={actions.canDelete}
          onEdit={onEdit ? () => onEdit(id) : undefined}
          onRestore={onRestore ? () => onRestore(id) : undefined}
          onDelete={onDelete ? () => onDelete(id) : undefined}
        />
      </EntityDetail.Header>
      <EntityDetail.Body>
        <EntityDetail.Fields items={generalInfo} />
        <EntityDetail.Separator />
        <EntityDetail.Section title="Contato">
          <EntityDetail.Fields items={contactInfo} />
        </EntityDetail.Section>
        <EntityDetail.Separator />
        <EntityDetail.Section title="Financeiro">
          <EntityDetail.Fields items={financialInfo} />
        </EntityDetail.Section>
        <EntityDetail.Separator />
        <EntityDetail.Section title="Anexos">
          <AttachmentSection canUpload ownerId={id} ownerKind="employee" />
        </EntityDetail.Section>
        <EntityDetail.Separator />
        <EntityDetail.Section title="Acesso">
          <EntityDetail.Fields items={accessInfo} />
        </EntityDetail.Section>
        <EntityDetail.Separator />
        <EntityDetail.Section title="Registro">
          <EntityDetail.Fields items={registerInfo} />
        </EntityDetail.Section>
      </EntityDetail.Body>
      <EntityDetail.Footer>
        <div className="flex w-full flex-col gap-2">
          {canGrantAccess || isGrantPasswordVisible ? (
            <AlertDialog
              open={isGrantDialogOpen}
              onOpenChange={(isOpen) => {
                setIsGrantDialogOpen(isOpen);
                handleTemporaryPasswordChange(isOpen);
              }}
            >
              {canGrantAccess ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setIsGrantDialogOpen(true)}
                >
                  Conceder acesso
                </Button>
              ) : null}
              <TemporaryPasswordDialog
                description={
                  isGrantPasswordVisible
                    ? `Compartilhe esta senha com ${employee.fullName}.`
                    : `Gerar senha temporária e liberar acesso ao sistema para ${employee.fullName}?`
                }
                generateLabel="Conceder acesso"
                isPending={isGrantPending}
                onCopy={handleCopyPassword}
                onGenerate={handleGrantAccessClick}
                temporaryPassword={
                  isGrantPasswordVisible ? temporaryPassword.value : null
                }
              />
            </AlertDialog>
          ) : null}
          {canRevokeAccess ? (
            <AlertDialog
              open={isRevokeDialogOpen}
              onOpenChange={setIsRevokeDialogOpen}
            >
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={() => setIsRevokeDialogOpen(true)}
              >
                Revogar acesso
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revogar acesso</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bloquear acesso ao sistema para {employee.fullName} e
                    encerrar sessões ativas?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isRevokePending}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRevokeAccessClick}
                    disabled={isRevokePending}
                    variant="destructive"
                  >
                    {isRevokePending ? "Revogando..." : "Revogar acesso"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          {canResetPassword ? (
            <AlertDialog
              open={isResetDialogOpen}
              onOpenChange={(isOpen) => {
                setIsResetDialogOpen(isOpen);
                handleTemporaryPasswordChange(isOpen);
              }}
            >
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setIsResetDialogOpen(true)}
              >
                Resetar senha
              </Button>
              <TemporaryPasswordDialog
                description={
                  temporaryPassword?.context === "reset"
                    ? `Compartilhe esta senha com ${employee.fullName}.`
                    : `Gerar nova senha temporária para ${employee.fullName}.`
                }
                generateLabel="Resetar senha"
                isPending={isResetPending}
                onCopy={handleCopyPassword}
                onGenerate={handleResetPassword}
                temporaryPassword={
                  temporaryPassword?.context === "reset"
                    ? temporaryPassword.value
                    : null
                }
              />
            </AlertDialog>
          ) : null}
          <DrawerClose asChild>
            <Button type="button" variant="outline" className="w-full">
              Fechar
            </Button>
          </DrawerClose>
        </div>
      </EntityDetail.Footer>
    </EntityDetail.Content>
  );
};

const EmployeeDetailsFallback = () => (
  <EntityDetail.Content>
    <EntityDetail.Header>
      <EntityDetail.Title>
        <EntityDetail.SkeletonTitle />
      </EntityDetail.Title>
    </EntityDetail.Header>
    <EntityDetail.Body>
      <EntityDetail.SkeletonFields rows={4} />
      <EntityDetail.Separator />
      <EntityDetail.Section title="Contato">
        <EntityDetail.SkeletonFields rows={1} />
      </EntityDetail.Section>
      <EntityDetail.Separator />
      <EntityDetail.Section title="Acesso">
        <EntityDetail.SkeletonFields rows={2} />
      </EntityDetail.Section>
      <EntityDetail.Separator />
      <EntityDetail.Section title="Financeiro">
        <EntityDetail.SkeletonFields rows={1} />
      </EntityDetail.Section>
      <EntityDetail.Separator />
      <EntityDetail.Section title="Anexos">
        <AttachmentSection
          canUpload
          ownerId={idPlaceholder}
          ownerKind="employee"
        />
      </EntityDetail.Section>
      <EntityDetail.Separator />
      <EntityDetail.Section title="Registro">
        <EntityDetail.SkeletonFields rows={2} />
      </EntityDetail.Section>
    </EntityDetail.Body>
    <EntityDetail.Footer />
  </EntityDetail.Content>
);

const idPlaceholder = 0 as EntityId;

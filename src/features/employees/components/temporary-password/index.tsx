import { CopyIcon } from "lucide-react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui";

interface TempPasswordDialogProps {
  description: string;
  generateLabel: string;
  isPending: boolean;
  onCopy: () => void;
  onGenerate: () => void;
  temporaryPassword: string | null;
}

export function TemporaryPasswordDialog({
  description,
  generateLabel,
  isPending,
  onCopy,
  onGenerate,
  temporaryPassword,
}: TempPasswordDialogProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {temporaryPassword ? "Senha temporária gerada" : generateLabel}
        </AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      {temporaryPassword ? (
        <div className="rounded-md border bg-muted/40 p-4">
          <div className="break-all font-mono text-center text-lg font-semibold tracking-[0.2em]">
            {temporaryPassword}
          </div>
        </div>
      ) : null}
      <AlertDialogFooter>
        {temporaryPassword ? (
          <>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
            <AlertDialogAction onClick={onCopy}>
              <CopyIcon size={16} />
              Copiar senha
            </AlertDialogAction>
          </>
        ) : (
          <>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onGenerate} disabled={isPending}>
              {isPending ? "Gerando..." : generateLabel}
            </AlertDialogAction>
          </>
        )}
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

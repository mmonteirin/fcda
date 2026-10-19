import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  error: string | null;
  title?: string;
}

export function ErrorMessage({ error, title = "Erro ao salvar" }: ErrorMessageProps) {
  if (!error) return null;

  return (
    <div role="alert" aria-live="assertive" className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
      <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="text-sm text-destructive/80 mt-1">{error}</p>
      </div>
    </div>
  );
}

export function getFriendlyErrorMessage(error: Error): string {
  const errorMessage = error.message;
  
  const friendlyMessages: Record<string, string> = {
    // Erros gerais de validação
    "String must contain at most": "Este campo excede o limite de caracteres permitido.",
    "String must contain at least": "Este campo não pode estar vazio.",
    "Invalid": "Formato inválido. Verifique os dados informados.",
    
    // Erros específicos de campos
    "120 character(s)": "O campo deve ter no máximo 120 caracteres.",
    "100 character(s)": "O campo deve ter no máximo 100 caracteres.",
    "80 character(s)": "O campo deve ter no máximo 80 caracteres.",
    "200 character(s)": "O campo deve ter no máximo 200 caracteres.",
    "500 character(s)": "O campo deve ter no máximo 500 caracteres.",
    "800 character(s)": "O campo deve ter no máximo 800 caracteres.",
    
    // Erros de slug
    "regex": "O slug (URL) deve conter apenas letras, números e hífens.",
    
    // Erros de UUID
    "Invalid uuid": "ID inválido.",
    
    // Erros de banco de dados
    "duplicate key": "Este registro já existe.",
    "foreign key": "Não é possível excluir este registro pois está em uso.",
    "null constraint": "Este campo é obrigatório.",
  };
  
  for (const [key, friendlyMessage] of Object.entries(friendlyMessages)) {
    if (errorMessage.includes(key)) {
      return friendlyMessage;
    }
  }
  
  return errorMessage;
}

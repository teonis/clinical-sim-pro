import { toast } from "sonner";

export interface AppError extends Error {
  code?: string;
  details?: string;
}

export const handleSupabaseError = (error: any, fallbackMessage: string) => {
  console.error(`[Supabase Error] ${fallbackMessage}:`, error);
  
  let message = fallbackMessage;
  
  if (error.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  // Translate common errors
  if (message.includes("JWT expired")) {
    message = "Sua sessão expirou. Por favor, faça login novamente.";
  } else if (message.includes("network error") || message.includes("Failed to fetch")) {
    message = "Erro de conexão. Verifique sua internet.";
  }

  toast.error(message);
  return new Error(message) as AppError;
};

export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.error("Failed to parse JSON:", json, e);
    return fallback;
  }
};

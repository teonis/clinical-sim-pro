import React, { Component, ErrorInfo, ReactNode } from "react";
import { Activity, AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Ops! Algo deu errado</h2>
              <p className="text-muted-foreground">
                Ocorreu um erro inesperado na aplicação. Por favor, tente recarregar a página.
              </p>
            </div>
            
            {this.state.error && (
              <div className="w-full bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground text-left overflow-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <Button 
              onClick={() => window.location.reload()}
              className="w-full gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Recarregar Sistema
            </Button>
            
            <div className="flex items-center gap-2 pt-4 border-t border-border w-full justify-center">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black tracking-tighter uppercase opacity-50">PULZU RECOVERY</span>
            </div>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;

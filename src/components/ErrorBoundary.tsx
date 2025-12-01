import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-blue-50 flex items-center justify-center px-4 py-16">
          <div className="max-w-2xl w-full text-center animate-fade-in">
            {/* Error Icon */}
            <div className="inline-flex items-center justify-center size-24 rounded-full bg-red-100 text-red-600 mb-8 animate-pulse">
              <AlertTriangle className="size-12" />
            </div>

            {/* Error Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Oops! Algo deu errado
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Encontramos um problema inesperado. Não se preocupe, estamos trabalhando nisso!
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 bg-white rounded-2xl border-2 border-red-200 p-6 text-left">
                <h3 className="font-bold text-red-900 mb-3">Detalhes do Erro (DEV)</h3>
                <div className="bg-red-50 rounded-lg p-4 overflow-auto max-h-64">
                  <p className="text-sm text-red-800 font-mono mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-red-700 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <RefreshCw className="size-5" />
                Tentar Novamente
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all font-semibold"
              >
                <Home className="size-5" />
                Voltar à Página Inicial
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-12 bg-white rounded-2xl border-2 border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-3">Precisa de ajuda?</h3>
              <p className="text-gray-700 mb-4">
                Se o problema persistir, entre em contato conosco pelo WhatsApp
              </p>
              <a
                href={`https://wa.me/244931054015?text=${encodeURIComponent('Olá! Estou tendo problemas no site da KZSTORE. Poderia me ajudar?')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Falar no WhatsApp
              </a>
            </div>

            {/* Error ID */}
            <p className="mt-6 text-sm text-gray-500">
              Erro ID: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
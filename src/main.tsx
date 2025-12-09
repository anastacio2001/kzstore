
  import './utils/fetch-wrapper'; // 🔥 MUST BE FIRST - Wrapper global para fetch
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { AuthProvider } from './providers/AuthProvider';
  import { ErrorBoundary } from './components/ErrorBoundary';

  createRoot(document.getElementById("root")!).render(
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  );
  
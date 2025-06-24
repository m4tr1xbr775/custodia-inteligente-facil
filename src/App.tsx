
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Audiencias from "./pages/Audiencias";
import Unidades from "./pages/Unidades";
import UnidadesPrisionais from "./pages/UnidadesPrisionais";
import Configuracoes from "./pages/Configuracoes";
import ConfiguracoesSlots from "./pages/ConfiguracoesSlots";
import Contatos from "./pages/Contatos";
import Plantoes from "./pages/Plantoes";
import Historico from "./pages/Historico";
import AdminSetup from "./pages/AdminSetup";
import AssistantSignup from "./pages/AssistantSignup";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./components/Layout/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/assistant-signup" element={<AssistantSignup />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="audiencias" element={<Audiencias />} />
                <Route path="unidades" element={<Unidades />} />
                <Route path="unidades-prisionais" element={<UnidadesPrisionais />} />
                <Route path="configuracoes" element={<Configuracoes />} />
                <Route path="configuracoes-slots" element={<ConfiguracoesSlots />} />
                <Route path="contatos" element={<Contatos />} />
                <Route path="plantoes" element={<Plantoes />} />
                <Route path="historico" element={<Historico />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

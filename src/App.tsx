
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Audiencias from "./pages/Audiencias";
import Plantoes from "./pages/Plantoes";
import Unidades from "./pages/Unidades";
import UnidadesPrisionais from "./pages/UnidadesPrisionais";
import Contatos from "./pages/Contatos";
import Configuracoes from "./pages/Configuracoes";
import ConfiguracoesSlots from "./pages/ConfiguracoesSlots";
import Auth from "./pages/Auth";
import AdminSetup from "./pages/AdminSetup";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./components/Layout/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-setup" element={<AdminSetup />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="audiencias" element={<Audiencias />} />
              <Route path="plantoes" element={<Plantoes />} />
              <Route path="unidades" element={<Unidades />} />
              <Route path="unidades-prisionais" element={<UnidadesPrisionais />} />
              <Route path="contatos" element={
                <ProtectedRoute requireAdmin>
                  <Contatos />
                </ProtectedRoute>
              } />
              <Route path="configuracoes-slots" element={
                <ProtectedRoute requireAdmin>
                  <ConfiguracoesSlots />
                </ProtectedRoute>
              } />
              <Route path="configuracoes" element={
                <ProtectedRoute requireAdmin>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

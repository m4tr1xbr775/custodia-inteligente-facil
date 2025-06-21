
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
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

// Componente para redirecionar usuários não ativos
const InactiveUserRedirect = () => {
  const { userProfile } = useAuth();
  
  if (userProfile && !userProfile.active) {
    return <Navigate to="/audiencias" replace />;
  }
  
  return <Dashboard />;
};

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
              <Route index element={<InactiveUserRedirect />} />
              <Route path="audiencias" element={
                <ProtectedRoute resource="audiencias" action="read">
                  <Audiencias />
                </ProtectedRoute>
              } />
              <Route path="plantoes" element={
                <ProtectedRoute resource="plantoes" action="read">
                  <Plantoes />
                </ProtectedRoute>
              } />
              <Route path="unidades" element={
                <ProtectedRoute resource="unidades" action="read">
                  <Unidades />
                </ProtectedRoute>
              } />
              <Route path="unidades-prisionais" element={
                <ProtectedRoute resource="unidades-prisionais" action="read">
                  <UnidadesPrisionais />
                </ProtectedRoute>
              } />
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

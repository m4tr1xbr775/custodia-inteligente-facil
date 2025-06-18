
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./lib/nav-items";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Audiencias from "./pages/Audiencias";
import Plantoes from "./pages/Plantoes";
import Unidades from "./pages/Unidades";
import UnidadesPrisionais from "./pages/UnidadesPrisionais";
import Contatos from "./pages/Contatos";
import Configuracoes from "./pages/Configuracoes";
import ConfiguracoesSlots from "./pages/ConfiguracoesSlots";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/Layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="audiencias" element={<Audiencias />} />
            <Route path="plantoes" element={<Plantoes />} />
            <Route path="unidades" element={<Unidades />} />
            <Route path="unidades-prisionais" element={<UnidadesPrisionais />} />
            <Route path="contatos" element={<Contatos />} />
            <Route path="configuracoes-slots" element={<ConfiguracoesSlots />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

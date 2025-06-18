
import { HomeIcon, Calendar, Settings, Phone, MapPin, Users, Gavel, Building } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Audiencias from "./pages/Audiencias";
import Configuracoes from "./pages/Configuracoes";
import Contatos from "./pages/Contatos";
import Plantoes from "./pages/Plantoes";
import Unidades from "./pages/Unidades";
import AgendamentoJuiz from "./pages/AgendamentoJuiz";
import UnidadesPrisionais from "./pages/UnidadesPrisionais";

export const navItems = [
  {
    title: "Início",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Audiências",
    to: "/audiencias",
    icon: <Calendar className="h-4 w-4" />,
    page: <Audiencias />,
  },
  {
    title: "Agendamento Juiz",
    to: "/agendamento-juiz",
    icon: <Gavel className="h-4 w-4" />,
    page: <AgendamentoJuiz />,
  },
  {
    title: "Unidades Prisionais",
    to: "/unidades-prisionais",
    icon: <Building className="h-4 w-4" />,
    page: <UnidadesPrisionais />,
  },
  {
    title: "Plantões",
    to: "/plantoes", 
    icon: <Users className="h-4 w-4" />,
    page: <Plantoes />,
  },
  {
    title: "Unidades",
    to: "/unidades",
    icon: <MapPin className="h-4 w-4" />,
    page: <Unidades />,
  },
  {
    title: "Contatos",
    to: "/contatos",
    icon: <Phone className="h-4 w-4" />,
    page: <Contatos />,
  },
  {
    title: "Configurações",
    to: "/configuracoes",
    icon: <Settings className="h-4 w-4" />,
    page: <Configuracoes />,
  },
];


import { 
  Calendar, 
  Users, 
  Building2, 
  Phone, 
  Settings, 
  BarChart3,
  UserPlus,
  History
} from "lucide-react";

export const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Audiências",
    href: "/audiencias",
    icon: Calendar,
  },
  {
    title: "Agenda de Contatos",
    href: "/plantoes",
    icon: Users,
  },
  {
    title: "Unidades Prisionais",
    href: "/unidades",
    icon: Building2,
  },
  {
    title: "UPR Audiências",
    href: "/unidades-prisionais",
    icon: Building2,
  },
  {
    title: "Cadastro Usuários",
    href: "/contatos",
    icon: UserPlus,
  },
  {
    title: "Histórico",
    href: "/historico",
    icon: History,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

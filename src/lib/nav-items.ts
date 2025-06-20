
import { 
  Calendar, 
  Users, 
  Building2, 
  Phone, 
  Settings, 
  BarChart3,
  Clock,
  UserPlus
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
    title: "Painel das UPR",
    href: "/unidades-prisionais",
    icon: Building2,
  },
  {
    title: "Cadastro Usuários",
    href: "/contatos",
    icon: UserPlus,
  },
  {
    title: "Pautas",
    href: "/configuracoes-slots",
    icon: Clock,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

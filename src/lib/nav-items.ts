
import { 
  Calendar, 
  Users, 
  Building2, 
  Phone, 
  Settings, 
  BarChart3,
  Clock
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
    title: "Plantões",
    href: "/plantoes",
    icon: Users,
  },
  {
    title: "Unidades",
    href: "/unidades",
    icon: Building2,
  },
  {
    title: "Unidades Prisionais",
    href: "/unidades-prisionais",
    icon: Building2,
  },
  {
    title: "Contatos",
    href: "/contatos",
    icon: Phone,
  },
  {
    title: "Slots",
    href: "/configuracoes-slots",
    icon: Clock,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

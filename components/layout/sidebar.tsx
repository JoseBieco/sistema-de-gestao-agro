"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Beef,
  Syringe,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Calendar,
  ClipboardList,
  ShoppingCart,
  Receipt,
  ArrowLeftRight,
  Baby,
  Package,
  Truck,
  List,
  Pill,
  Stethoscope,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Principal",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Rebanho",
    items: [
      { title: "Animais", href: "/animais", icon: Beef },
      { title: "Raças", href: "/racas", icon: ClipboardList },
      { title: "Manejo", href: "/manejo", icon: ArrowLeftRight },
      { title: "Reprodução", href: "/reproducao", icon: Baby },
    ],
  },
  {
    title: "Sanitário",
    items: [
      { title: "Calendário", href: "/calendario", icon: Calendar },
      { title: "Vacinas", href: "/vacinas", icon: Syringe },
      { title: "Estoque", href: "/sanitario/estoque", icon: Pill },
      { title: "Livro de Doenças", href: "/sanitario/doencas", icon: Stethoscope },
    ],
  },
  {
    title: "Estoque e Nutrição",
    items: [
      { title: "Dashboard", href: "/insumos", icon: Package },
      { title: "Catálogo", href: "/insumos/catalogo", icon: ClipboardList },
      { title: "Compras", href: "/insumos/compras", icon: ShoppingCart },
      { title: "Recebimentos", href: "/insumos/recebimento", icon: Truck },
      { title: "Kardex", href: "/insumos/kardex", icon: List },
    ],
  },
  {
    title: "Financeiro",
    items: [
      { title: "Compras", href: "/compras", icon: ShoppingCart },
      { title: "Vendas", href: "/vendas", icon: TrendingUp },
      { title: "Parcelas", href: "/parcelas", icon: Receipt },
      { title: "Parceiros", href: "/parceiros", icon: Users },
    ],
  },
  {
    title: "Sistema",
    items: [
      { title: "Relatórios", href: "/relatorios", icon: FileText },
      { title: "Configurações", href: "/configuracoes", icon: Settings },
    ],
  },
];

const OPEN_GROUPS_STORAGE_KEY = "sidebar:openGroups";

/**
 * Entre vários hrefs que "combinam" com a rota atual (ex: "/insumos" e
 * "/insumos/catalogo" para a rota "/insumos/catalogo/123"), o mais específico
 * (mais longo) é o item que deve aparecer como ativo — evita que a página
 * inicial de um grupo (ex: "/insumos") acenda junto com a subpágina real.
 */
function getActiveHref(pathname: string): string | null {
  let best: string | null = null;
  for (const group of navigation) {
    for (const item of group.items) {
      const matches =
        pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && (best === null || item.href.length > best.length)) {
        best = item.href;
      }
    }
  }
  return best;
}

function groupContainingHref(href: string | null): string | null {
  if (!href) return null;
  const group = navigation.find((g) => g.items.some((i) => i.href === href));
  return group?.title ?? null;
}

function readStoredOpenGroups(): Record<string, boolean> | null {
  try {
    const raw = window.localStorage.getItem(OPEN_GROUPS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredOpenGroups(state: Record<string, boolean>) {
  try {
    window.localStorage.setItem(OPEN_GROUPS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage indisponível (modo privado, etc.) — ok seguir sem persistir.
  }
}

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const activeHref = getActiveHref(pathname);
  const activeGroup = groupContainingHref(activeHref);

  // Por padrão só a seção da página atual vem aberta — evita a rolagem longa
  // com todos os grupos expandidos ao mesmo tempo. Preferências manuais do
  // usuário (abrir/fechar outro grupo) ficam salvas entre navegações.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => ({
    [activeGroup ?? ""]: true,
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredOpenGroups();
    setOpenGroups((prev) => ({ ...prev, ...stored, [activeGroup ?? ""]: true }));
    setHydrated(true);
    // Só na montagem: depois disso quem manda é a navegação/o clique do usuário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated || !activeGroup) return;
    setOpenGroups((prev) => {
      if (prev[activeGroup]) return prev;
      const next = { ...prev, [activeGroup]: true };
      writeStoredOpenGroups(next);
      return next;
    });
  }, [activeGroup, hydrated]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      writeStoredOpenGroups(next);
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Beef className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                Gestão
              </span>
              <span className="text-xs text-sidebar-foreground/70 leading-tight">
                Pecuária 360
              </span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary mx-auto">
            <Beef className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((group) => {
            // Grupos com um único item (ex: "Principal") não precisam de
            // acordeão — o link já fica sempre visível.
            if (group.items.length <= 1 || collapsed) {
              return (
                <div key={group.title} className="space-y-1 pb-2">
                  {!collapsed && group.items.length > 1 && (
                    <h4 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                      {group.title}
                    </h4>
                  )}
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={item.href === activeHref}
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              );
            }

            const isOpen = openGroups[group.title] ?? false;

            return (
              <Collapsible
                key={group.title}
                open={isOpen}
                onOpenChange={() => toggleGroup(group.title)}
                className="pb-1"
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/80"
                  >
                    <span className="flex items-center gap-1.5">
                      {group.title}
                      {group.title === activeGroup && !isOpen && (
                        <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                      )}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={item.href === activeHref}
                      collapsed={collapsed}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Collapse Button */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCollapsedChange(!collapsed)}
          className="w-full justify-center text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Recolher</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <item.icon
        className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")}
      />
      {!collapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {item.title}
      </TooltipContent>
    </Tooltip>
  );
}

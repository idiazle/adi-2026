import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Calculator,
    ChevronDown,
    CreditCard,
    FileText,
    GraduationCap,
    Home,
    LogOut,
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    Search,
    Settings,
    Users,
} from 'lucide-react';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/shared/components/ui/sheet';
import { cn } from '@/shared/lib/utils';

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  submenu?: NavSubItem[];
}

const navigation: NavItem[] = [
    { label: 'Inicio', href: '/intranet', icon: Home },
    {
        label: 'Academia',
        icon: BookOpen,
        submenu: [
            { label: 'Alumnos', href: '/intranet/academia/alumnos' },
            { label: 'Cursos', href: '/intranet/academia/cursos' },
            { label: 'Asistencia', href: '/intranet/academia/asistencia' },
            { label: 'Calificaciones', href: '/intranet/academia/calificaciones' },
        ],
    },
    {
        label: 'Concurso CREM',
        icon: Calculator,
        submenu: [
            { label: 'Categorías', href: '/intranet/crem/categorias' },
            { label: 'Inscripciones', href: '/intranet/crem/inscripciones' },
            { label: 'Jurados', href: '/intranet/crem/jurados' },
            { label: 'Resultados', href: '/intranet/crem/resultados' },
            { label: 'Configuración', href: '/intranet/crem/configuracion' },
        ],
    },
    {
        label: 'Finanzas',
        icon: CreditCard,
        submenu: [
            { label: 'Pagos Cursos', href: '/intranet/finanzas/pagos-cursos' },
            { label: 'Pagos Concurso', href: '/intranet/finanzas/pagos-concurso' },
        ],
    },
    {
        label: 'Profesores',
        icon: GraduationCap,
        submenu: [
            { label: 'Lista', href: '/intranet/profesores/lista' },
            { label: 'Asignaciones', href: '/intranet/profesores/asignaciones' },
        ],
    },
    {
        label: 'Reportes',
        icon: FileText,
        submenu: [
            { label: 'General', href: '/intranet/reportes/general' },
            { label: 'Alumnos', href: '/intranet/reportes/alumnos' },
            { label: 'Finanzas', href: '/intranet/reportes/finanzas' },
        ],
    },
    { label: 'Configuración', href: '/intranet/settings', icon: Settings },
];

interface IntranetLayoutProps {
  children: React.ReactNode;
}

export default function IntranetLayout({ children }: IntranetLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const { url } = usePage();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (href?: string, hasSubmenu?: boolean) => {
    if (!href) {
      return false;
    }

    // Items without submenu: exact match only
    if (!hasSubmenu) {
      return url === href;
    }

    // Items with submenu: match if URL starts with href (handles /intranet/xxx)
    return url === href || url.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo Area */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <Link href="/intranet" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <span className="font-semibold text-gray-900">Admin</span>
            </Link>
          ) : (
            <Link href="/intranet" className="mx-auto">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus[item.label];
            const itemActive = isActive(item.href, hasSubmenu);
            const hasActiveChild = hasSubmenu && item.submenu?.some((sub) => isActive(sub.href));

            if (!sidebarOpen) {
              // Collapsed sidebar - no submenus
              return (
                <Link
                  key={item.label}
                  href={item.href || '#'}
                  onClick={hasSubmenu ? (e) => {
                    e.preventDefault(); toggleSubmenu(item.label);
                  } : undefined}
                  className={cn(
                    'flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    itemActive || hasActiveChild
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', (itemActive || hasActiveChild) && 'text-indigo-600')} />
                </Link>
              );
            }

            // Expanded sidebar with submenus
            return (
              <div key={item.label}>
                {hasSubmenu ? (
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      itemActive || hasActiveChild
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', (itemActive || hasActiveChild) && 'text-indigo-600')} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={item.href || '#'}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      itemActive
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', itemActive && 'text-indigo-600')} />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                )}

                {/* Submenu */}
                {hasSubmenu && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                    {item.submenu?.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                          isActive(subItem.href)
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5" />
            ) : (
              <PanelLeftOpen className="w-5 h-5" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <Link href="/intranet" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <span className="font-semibold text-gray-900">Admin</span>
            </Link>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenus[item.label];
              const itemActive = isActive(item.href, hasSubmenu);
              const hasActiveChild = hasSubmenu && item.submenu?.some((sub) => isActive(sub.href));

              return (
                <div key={item.label}>
                  {hasSubmenu ? (
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        itemActive || hasActiveChild
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon className={cn('w-5 h-5 flex-shrink-0', (itemActive || hasActiveChild) && 'text-indigo-600')} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        itemActive
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <Icon className={cn('w-5 h-5 flex-shrink-0', itemActive && 'text-indigo-600')} />
                      <span className="flex-1 text-left">{item.label}</span>
                    </Link>
                  )}

                  {/* Mobile Submenu */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                            isActive(subItem.href)
                              ? 'bg-indigo-100 text-indigo-700 font-medium'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-4 md:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              {/* Search */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 w-64">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent border-none outline-none text-sm text-gray-700 w-full"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm">JD</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium text-gray-700">John Doe</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">John Doe</span>
                      <span className="text-xs text-gray-500">john.doe@example.com</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/intranet/profile" className="cursor-pointer">
                      <Users className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/intranet/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

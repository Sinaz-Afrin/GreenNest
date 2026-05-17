'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import {
  Leaf,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Calendar,
  User,
  Menu,
  LogOut,
  Store,
  Settings,
  Users,
  BarChart,
  CheckCircle,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const customerLinks: SidebarLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/cart', label: 'Cart', icon: <ShoppingCart className="h-5 w-5" /> },
  { href: '/orders', label: 'Orders', icon: <Package className="h-5 w-5" /> },
  { href: '/bookings', label: 'Bookings', icon: <Calendar className="h-5 w-5" /> },
  { href: '/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const vendorLinks: SidebarLink[] = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/vendor/products', label: 'Products', icon: <Package className="h-5 w-5" /> },
  { href: '/vendor/orders', label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { href: '/vendor/services', label: 'Services', icon: <Settings className="h-5 w-5" /> },
  { href: '/vendor/bookings', label: 'Bookings', icon: <Calendar className="h-5 w-5" /> },
  { href: '/vendor/earnings', label: 'Earnings', icon: <DollarSign className="h-5 w-5" /> },
  { href: '/vendor/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

const adminLinks: SidebarLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/admin/vendors', label: 'Vendors', icon: <CheckCircle className="h-5 w-5" /> },
  { href: '/admin/users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { href: '/admin/products', label: 'Products', icon: <Package className="h-5 w-5" /> },
  { href: '/admin/categories', label: 'Categories', icon: <Store className="h-5 w-5" /> },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { href: '/admin/bookings', label: 'Bookings', icon: <Calendar className="h-5 w-5" /> },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = user?.role === 'admin' 
    ? adminLinks 
    : user?.role === 'vendor' 
    ? vendorLinks 
    : customerLinks;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold text-primary">GreenNest</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-card fixed left-0 top-0">
        <SidebarContent />
      </aside>
    </>
  );
}

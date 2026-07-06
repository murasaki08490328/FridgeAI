"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Refrigerator, ShoppingCart } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const shoppingList = useAppStore((state) => state.shoppingList);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/fridge', icon: Refrigerator, label: 'Mon Frigo' },
    { href: '/shopping', icon: ShoppingCart, label: 'Courses' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-[#10b981]' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {mounted && item.href === '/shopping' && shoppingList.length > 0 && (
                <span className="absolute top-2 right-[20%] flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/login', label: 'Login' },
  ];

  return (
    <nav className="flex space-x-4">
      {links.map(({ href, label }) => (
        <Link 
          key={href} 
          href={href}
          className={`${pathname === href ? 'font-bold' : 'font-normal'} hover:text-gray-700 transition-colors`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
};
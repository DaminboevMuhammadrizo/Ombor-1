'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car } from 'lucide-react';
import { Wrench } from 'lucide-react';
import { FileText } from 'lucide-react';
import { Home } from 'lucide-react';

function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            name: 'Dashboard',
            href: '/',
            icon: Home
        },
        {
            name: 'Mashinalar',
            href: '/cars',
            icon: Car
        },
        {
            name: 'Zapchastlar',
            href: '/spare-parts',
            icon: Wrench
        },
        {
            name: 'Tamirlash',
            href: '/orders',
            icon: FileText
        },
    ];

    return (
        <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-center">
                <h1 className="text-xl font-bold">Ombor 1</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${isActive
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="ml-3">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;

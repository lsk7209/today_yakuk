import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex mb-6 overflow-x-auto no-scrollbar py-1" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-[var(--muted)] whitespace-nowrap">
                <li>
                    <Link href="/" className="hover:text-brand-700 flex items-center transition-colors">
                        <Home className="h-4 w-4" />
                        <span className="sr-only">홈</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-brand-700 transition-colors font-medium"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="font-semibold text-gray-900" aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

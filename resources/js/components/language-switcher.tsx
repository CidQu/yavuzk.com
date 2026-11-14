import { router, usePage } from '@inertiajs/react';
import { LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
    const { locale } = usePage().props;

    const change = (code: string) => {
        if (code === locale.current) {
            return;
        }

        router.post(locale.action, { locale: code }, { preserveScroll: true });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={locale.label}>
                    <LanguagesIcon />
                    <span className="font-mono text-xs uppercase">
                        {locale.current}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuLabel>{locale.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                    value={locale.current}
                    onValueChange={change}
                >
                    {locale.options.map((option) => (
                        <DropdownMenuRadioItem
                            key={option.code}
                            value={option.code}
                        >
                            {option.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

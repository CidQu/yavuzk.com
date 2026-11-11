import { GlobeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { router, usePage } from '@inertiajs/react';
import { useId } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function LanguageSwitcher() {
    const { locale } = usePage().props;
    const labelId = useId();

    const change = (code: string) => {
        if (code === locale.current) {
            return;
        }

        router.post(locale.action, { locale: code }, { preserveScroll: true });
    };

    return (
        <div className="flex items-center gap-3">
            <span
                id={labelId}
                className="text-xs tracking-[0.08em] text-muted-foreground uppercase"
            >
                {locale.label}
            </span>
            <Select value={locale.current} onValueChange={change}>
                <SelectTrigger
                    aria-labelledby={labelId}
                    className="min-w-36 bg-muted hover:bg-accent"
                >
                    <HugeiconsIcon
                        icon={GlobeIcon}
                        strokeWidth={2}
                        className="text-muted-foreground"
                    />
                    <SelectValue />
                </SelectTrigger>
                <SelectContent align="end" position="popper">
                    {locale.options.map((option) => (
                        <SelectItem key={option.code} value={option.code}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

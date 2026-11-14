import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
    const toggle = () => {
        const dark = !document.documentElement.classList.contains('dark');

        document.documentElement.classList.toggle('dark', dark);

        try {
            localStorage.setItem('theme', dark ? 'dark' : 'light');
        } catch {
            // Storage can be unavailable (private mode); the toggle still works for this visit.
        }
    };

    return (
        <Button variant="ghost" size="icon-sm" onClick={toggle}>
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="dark:hidden" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}

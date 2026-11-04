import { createInertiaApp } from '@inertiajs/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';

const appName = import.meta.env.VITE_APP_NAME || 'CidQu';

void createInertiaApp({
    title: (title) => (title ? `${appName} · ${title}` : appName),
    layout: () => AppLayout,
    strictMode: true,
    withApp(app) {
        return <TooltipProvider delayDuration={150}>{app}</TooltipProvider>;
    },
    progress: {
        color: '#2563eb',
    },
});

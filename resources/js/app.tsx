import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/shared/components/ui/sonner';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { initializeTheme } from '@/shared/hooks/use-appearance';
import IntranetLayout from '@/shared/layouts/IntranetLayout';

const appName = import.meta.env.VITE_APP_NAME || 'ADI - Club Físicos Matemáticos';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'landing/welcome':
                return null;
            case name.startsWith('auth/'):
                return null;
            case name.startsWith('settings/'):
                return null;
            case name.startsWith('intranet/auth/'):
                return null;
            case name.startsWith('intranet/'):
                return IntranetLayout;
            default:
                return null;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

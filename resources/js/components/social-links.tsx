import type { IconType } from 'react-icons';
import {
    FaAppStoreIos,
    FaGithub,
    FaGooglePlay,
    FaInstagram,
    FaLinkedinIn,
    FaSteam,
} from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export interface SocialLink {
    label: string;
    icon: string;
    url: string;
}

const icons: Record<string, IconType> = {
    'google-play': FaGooglePlay,
    'app-store': FaAppStoreIos,
    instagram: FaInstagram,
    steam: FaSteam,
    github: FaGithub,
    linkedin: FaLinkedinIn,
};

export default function SocialLinks({ links }: { links: SocialLink[] }) {
    return (
        <ul className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            {links.map((link) => {
                const Icon = icons[link.icon];

                return (
                    <li key={link.url}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="icon-lg"
                                    className="size-11 rounded-xl text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-accent hover:text-primary"
                                >
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.label}
                                    >
                                        {Icon ? (
                                            <Icon className="size-5" aria-hidden />
                                        ) : (
                                            link.label.charAt(0)
                                        )}
                                    </a>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>{link.label}</TooltipContent>
                        </Tooltip>
                    </li>
                );
            })}
        </ul>
    );
}

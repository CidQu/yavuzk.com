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
        <ul className="flex flex-wrap items-center gap-1">
            {links.map((link) => {
                const Icon = icons[link.icon];

                return (
                    <li key={link.url}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground"
                                >
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={link.label}
                                    >
                                        {Icon ? (
                                            <Icon aria-hidden />
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

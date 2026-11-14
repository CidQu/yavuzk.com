import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRightIcon,
    BriefcaseIcon,
    CircleUserIcon,
    FileUserIcon,
    FolderGit2Icon,
    Gamepad2Icon,
    GitCommitHorizontalIcon,
    InfoIcon,
    LanguagesIcon,
    MailIcon,
    StarIcon,
    UsersIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import SocialLinks from '@/components/social-links';
import type { SocialLink } from '@/components/social-links';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Stat {
    label: string;
    icon: string;
    value: number | null;
}

interface QuickLink {
    label: string;
    icon: string;
    url: string;
    is_external: boolean;
}

interface HomeProps {
    title: string;
    greeting: string;
    heading: string;
    avatar: string;
    socials: SocialLink[];
    stats: Stat[];
    links: QuickLink[];
    notice: { title: string; message: string } | null;
}

const icons: Record<string, LucideIcon> = {
    stars: StarIcon,
    repositories: FolderGit2Icon,
    commits: GitCommitHorizontalIcon,
    followers: UsersIcon,
    projects: BriefcaseIcon,
    contact: MailIcon,
    about: CircleUserIcon,
    cv: FileUserIcon,
    translations: LanguagesIcon,
    games: Gamepad2Icon,
};

export default function Home({
    title,
    greeting,
    heading,
    avatar,
    socials,
    stats,
    links,
    notice,
}: HomeProps) {
    const { locale } = usePage().props;
    const formatter = new Intl.NumberFormat(locale.current);

    return (
        <>
            <Head title={title} />

            {notice && (
                <Alert>
                    <InfoIcon />
                    <AlertTitle>{notice.title}</AlertTitle>
                    <AlertDescription>{notice.message}</AlertDescription>
                </Alert>
            )}

            <section className="flex flex-col gap-6 py-6 sm:py-10">
                <Avatar className="size-20 border sm:size-24">
                    <AvatarImage src={avatar} alt="CidQu avatar" />
                    <AvatarFallback>{heading.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                    <p className="text-muted-foreground sm:text-lg">
                        {greeting}
                    </p>
                    <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl">
                        {heading}
                    </h1>
                </div>

                <nav className="flex flex-wrap gap-2">
                    {links.map((link, index) => {
                        const Icon = icons[link.icon];
                        const content = (
                            <>
                                {Icon && <Icon />}
                                {link.label}
                                {link.is_external && (
                                    <ArrowUpRightIcon className="opacity-60" />
                                )}
                            </>
                        );

                        return (
                            <Button
                                key={link.url}
                                asChild
                                variant={index === 0 ? 'default' : 'outline'}
                            >
                                {link.is_external ? (
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <Link href={link.url}>{content}</Link>
                                )}
                            </Button>
                        );
                    })}
                </nav>

                <div className="-ml-2.5">
                    <SocialLinks links={socials} />
                </div>
            </section>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = icons[stat.icon];

                    return (
                        <Card key={stat.icon}>
                            <CardHeader>
                                <CardDescription>{stat.label}</CardDescription>
                                <CardTitle className="text-3xl tabular-nums">
                                    {stat.value === null
                                        ? '—'
                                        : formatter.format(stat.value)}
                                </CardTitle>
                                {Icon && (
                                    <CardAction>
                                        <Icon className="size-4 text-muted-foreground" />
                                    </CardAction>
                                )}
                            </CardHeader>
                        </Card>
                    );
                })}
            </section>
        </>
    );
}

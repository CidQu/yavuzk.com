import {
    ArrowUpRight01Icon,
    Briefcase01Icon,
    FileUserIcon,
    FolderGitTwoIcon,
    GitBranchIcon,
    InformationCircleIcon,
    Mail01Icon,
    StarIcon,
    TranslateIcon,
    UserCircleIcon,
    UserGroupIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import { Head, Link, usePage } from '@inertiajs/react';
import SocialLinks from '@/components/social-links';
import type { SocialLink } from '@/components/social-links';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

const icons: Record<string, IconSvgElement> = {
    stars: StarIcon,
    repositories: FolderGitTwoIcon,
    commits: GitBranchIcon,
    followers: UserGroupIcon,
    projects: Briefcase01Icon,
    contact: Mail01Icon,
    about: UserCircleIcon,
    cv: FileUserIcon,
    translations: TranslateIcon,
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

            <Card className="rounded-4xl py-0">
                <CardContent className="flex flex-col items-center gap-8 p-6 sm:p-8 md:flex-row md:gap-12 md:p-10">
                    <img
                        src={avatar}
                        alt="CidQu avatar"
                        width={200}
                        height={200}
                        className="size-40 shrink-0 rounded-4xl bg-muted object-cover ring-1 ring-foreground/10 sm:size-50"
                    />

                    <div className="flex min-w-0 flex-1 flex-col items-center gap-6 text-center md:items-start md:text-left">
                        <div className="space-y-2">
                            <p className="text-base text-muted-foreground">
                                {greeting}
                            </p>
                            <h1 className="font-heading text-5xl font-semibold tracking-tight sm:text-6xl">
                                {heading}
                            </h1>
                        </div>

                        {notice && (
                            <Alert className="rounded-2xl border-info-border bg-info text-left text-info-foreground">
                                <HugeiconsIcon
                                    icon={InformationCircleIcon}
                                    strokeWidth={2}
                                />
                                <AlertTitle className="font-semibold">
                                    {notice.title}
                                </AlertTitle>
                                <AlertDescription className="text-info-foreground/80">
                                    {notice.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <SocialLinks links={socials} />
                    </div>
                </CardContent>
            </Card>

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.icon} className="rounded-3xl">
                        <CardContent className="flex flex-col items-center gap-3 text-center">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
                                <HugeiconsIcon
                                    icon={icons[stat.icon]}
                                    strokeWidth={1.75}
                                    className="size-6"
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {stat.label}
                            </p>
                            <p className="font-heading text-3xl font-semibold tabular-nums">
                                {stat.value === null
                                    ? '—'
                                    : formatter.format(stat.value)}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <Separator className="mt-2" />

            <nav className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
                {links.map((link) => {
                    const content = (
                        <>
                            <HugeiconsIcon
                                icon={icons[link.icon]}
                                strokeWidth={2}
                                data-icon="inline-start"
                            />
                            {link.label}
                            {link.is_external && (
                                <HugeiconsIcon
                                    icon={ArrowUpRight01Icon}
                                    strokeWidth={2}
                                    data-icon="inline-end"
                                    className="opacity-70"
                                />
                            )}
                        </>
                    );

                    return (
                        <Button
                            key={link.url}
                            asChild
                            size="lg"
                            className="h-13 px-6 text-base font-semibold tracking-[0.02em] transition-all hover:-translate-y-0.5 hover:bg-primary/90 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*='size-'])]:size-4.5"
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
        </>
    );
}

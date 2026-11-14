<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PageController extends Controller
{
    public function home(): Response
    {
        $profile = config('profile');
        $locale = app()->getLocale();
        $documents = $profile['documents'];

        $projectPath = $documents['projects'][$locale] ?? $documents['projects']['default'];
        $cvPath = $documents['cv'][$locale] ?? $documents['cv']['default'];
        $github = $this->githubStats();

        $stats = [
            [
                'label' => $this->statLabel('messages.m8aoxw8n'),
                'icon' => 'stars',
                'value' => $github['stars'],
            ],
            [
                'label' => $this->statLabel('messages.ctf9bd2g'),
                'icon' => 'repositories',
                'value' => $github['repositories'],
            ],
            [
                'label' => $this->statLabel('messages.z2ovz82h'),
                'icon' => 'commits',
                'value' => $github['commits'] ?? $profile['stats']['commits'] ?? null,
            ],
            [
                'label' => $this->statLabel('messages.ks8d3fyc'),
                'icon' => 'followers',
                'value' => $github['followers'],
            ],
        ];

        $ctaButtons = [
            [
                'label' => __('messages.ezjwvsoo'),
                'icon' => 'projects',
                'url' => route('documents.show', [
                    'path' => $projectPath,
                    'title' => __('messages.a12egi9x'),
                ]),
                'is_external' => false,
            ],
            [
                'label' => __('messages.1xhundca'),
                'icon' => 'contact',
                'url' => $profile['cta']['contact'],
                'is_external' => true,
            ],
            [
                'label' => __('messages.vo6pfazd'),
                'icon' => 'about',
                'url' => route('about'),
                'is_external' => false,
            ],
            [
                'label' => __('messages.meurc5ww'),
                'icon' => 'cv',
                'url' => route('documents.show', [
                    'path' => $cvPath,
                    'title' => __('messages.tqg10wtp'),
                ]),
                'is_external' => false,
            ],
            [
                'label' => __('messages.uurh0c3k'),
                'icon' => 'translations',
                'url' => $profile['cta']['translations'],
                'is_external' => true,
            ],
            [
                'label' => __('messages.steam_games'),
                'icon' => 'games',
                'url' => $profile['cta']['steam'],
                'is_external' => true,
            ],
        ];

        return Inertia::render('home', [
            'title' => __('messages.2md6j0g0'),
            'greeting' => __('messages.2zc38qby'),
            'heading' => __('messages.uiwm9ux4'),
            'avatar' => asset($profile['hero']['avatar']),
            'socials' => $profile['socials'],
            'stats' => $stats,
            'links' => $ctaButtons,
            'notice' => $locale === 'nl' ? ($profile['notices']['nl'] ?? null) : null,
        ]);
    }

    public function about(): Response
    {
        $profile = config('profile');

        return Inertia::render('about', [
            'title' => __('messages.mt2hlzom'),
            'fullName' => __('messages.iaw9a94h'),
            'photo' => asset($profile['about']['profile_photo']),
            'sections' => collect($profile['about']['sections'])
                ->map(fn (array $section) => [
                    'title' => __('messages.'.$section['title_key']),
                    'body' => __('messages.'.$section['body_key']),
                ])
                ->all(),
            'gallery' => [
                'title' => __('messages.ksc1h3vk'),
                'description' => __('messages.0q0626om'),
                'photos' => collect($profile['about']['photos'])
                    ->map(fn (string $photo) => asset('assets/images/'.$photo))
                    ->all(),
            ],
        ]);
    }

    /**
     * Stat cards render the label above the value, so drop the trailing
     * colon the translations carry for inline use.
     */
    private function statLabel(string $key): string
    {
        return rtrim(__($key), ': ');
    }

    /**
     * Public GitHub numbers for the stat cards, straight from the GitHub API.
     * Successful lookups are cached for an hour; a failed lookup is retried
     * after five minutes so we don't burn through the unauthenticated rate
     * limit (60 requests/hour). Set GITHUB_TOKEN to raise that limit.
     *
     * @return array{stars: ?int, repositories: ?int, commits: ?int, followers: ?int}
     */
    private function githubStats(): array
    {
        $cached = Cache::get('github-stats');

        if (is_array($cached)) {
            return $cached;
        }

        $username = config('profile.github.username');
        $profile = $this->github("users/{$username}");

        $stats = [
            'stars' => $this->fetchStarCount($username),
            'repositories' => $profile['public_repos'] ?? null,
            'commits' => $this->github('search/commits', ['q' => "author:{$username}", 'per_page' => 1])['total_count'] ?? null,
            'followers' => $profile['followers'] ?? null,
        ];

        $complete = ! in_array(null, $stats, true);
        Cache::put('github-stats', $stats, now()->addMinutes($complete ? 60 : 5));

        return $stats;
    }

    /**
     * Sum the stars across every repository the user owns.
     */
    private function fetchStarCount(string $username): ?int
    {
        $stars = 0;

        for ($page = 1; $page <= 10; $page++) {
            $repositories = $this->github("users/{$username}/repos", [
                'type' => 'owner',
                'per_page' => 100,
                'page' => $page,
            ]);

            if ($repositories === null) {
                return null;
            }

            $stars += array_sum(array_column($repositories, 'stargazers_count'));

            if (count($repositories) < 100) {
                break;
            }
        }

        return $stars;
    }

    /**
     * @param  array<string, mixed>  $query
     * @return array<mixed>|null
     */
    private function github(string $path, array $query = []): ?array
    {
        $request = Http::withHeaders([
            'User-Agent' => 'CidQu Laravel',
            'Accept' => 'application/vnd.github+json',
        ])->timeout(5);

        if ($token = config('profile.github.token')) {
            $request->withToken($token);
        }

        try {
            $response = $request->get("https://api.github.com/{$path}", $query);
        } catch (Throwable) {
            return null;
        }

        return $response->successful() ? $response->json() : null;
    }
}

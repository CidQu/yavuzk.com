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
        $githubProfile = $this->fetchGithubProfile() ?? [];

        $stats = [
            [
                'label' => $this->statLabel('messages.m8aoxw8n'),
                'icon' => 'stars',
                'value' => $this->fetchStarCount(),
            ],
            [
                'label' => $this->statLabel('messages.ctf9bd2g'),
                'icon' => 'repositories',
                'value' => $githubProfile['public_repos'] ?? null,
            ],
            [
                'label' => $this->statLabel('messages.z2ovz82h'),
                'icon' => 'commits',
                'value' => $profile['stats']['commits'] ?? null,
            ],
            [
                'label' => $this->statLabel('messages.ks8d3fyc'),
                'icon' => 'followers',
                'value' => $githubProfile['followers'] ?? null,
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

    private function fetchStarCount(): ?int
    {
        $cacheKey = 'github-stars';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::timeout(5)->get('https://api.github-star-counter.workers.dev/user/cidqu');
        } catch (Throwable) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $stars = (int) data_get($response->json(), 'stars');
        Cache::put($cacheKey, $stars, now()->addMinutes(15));

        return $stars;
    }

    private function fetchGithubProfile(): ?array
    {
        $cacheKey = 'github-profile';

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'CidQu Laravel',
                'Accept' => 'application/vnd.github+json',
            ])->timeout(5)->get('https://api.github.com/users/cidqu');
        } catch (Throwable) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $payload = $response->json();
        Cache::put($cacheKey, $payload, now()->addMinutes(15));

        return $payload;
    }
}

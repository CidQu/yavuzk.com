<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\View\View;
use Throwable;

class PageController extends Controller
{
    public function home(): View
    {
        $profile = config('profile');
        $locale = app()->getLocale();
        $documents = $profile['documents'];

        $projectPath = $documents['projects'][$locale] ?? $documents['projects']['default'];
        $cvPath = $documents['cv'][$locale] ?? $documents['cv']['default'];
        $githubProfile = $this->fetchGithubProfile() ?? [];

        $stats = [
            [
                'label' => __('messages.m8aoxw8n'),
                'icon' => 'fa-solid fa-star',
                'value' => $this->fetchStarCount(),
            ],
            [
                'label' => __('messages.ctf9bd2g'),
                'icon' => 'fa-solid fa-layer-group',
                'value' => $githubProfile['public_repos'] ?? null,
            ],
            [
                'label' => __('messages.z2ovz82h'),
                'icon' => 'fa-solid fa-code-branch',
                'value' => $profile['stats']['commits'] ?? null,
            ],
            [
                'label' => __('messages.ks8d3fyc'),
                'icon' => 'fa-solid fa-users',
                'value' => $githubProfile['followers'] ?? null,
            ],
        ];

        $ctaButtons = [
            [
                'label' => __('messages.ezjwvsoo'),
                'url' => route('documents.show', [
                    'path' => $projectPath,
                    'title' => __('messages.a12egi9x'),
                ]),
                'is_external' => false,
            ],
            [
                'label' => __('messages.1xhundca'),
                'url' => $profile['cta']['contact'],
                'is_external' => true,
            ],
            [
                'label' => __('messages.vo6pfazd'),
                'url' => route('about'),
                'is_external' => false,
            ],
            [
                'label' => __('messages.meurc5ww'),
                'url' => route('documents.show', [
                    'path' => $cvPath,
                    'title' => __('messages.tqg10wtp'),
                ]),
                'is_external' => false,
            ],
            [
                'label' => __('messages.uurh0c3k'),
                'url' => $profile['cta']['translations'],
                'is_external' => true,
            ],
        ];

        return view('pages.home', [
            'heroImage' => $profile['hero']['avatar'],
            'socialLinks' => $profile['socials'],
            'stats' => $stats,
            'ctaButtons' => $ctaButtons,
            'nlNotice' => $locale === 'nl' ? ($profile['notices']['nl'] ?? null) : null,
        ]);
    }

    public function about(): View
    {
        $profile = config('profile');

        return view('pages.about', [
            'profilePhoto' => $profile['about']['profile_photo'],
            'sections' => $profile['about']['sections'],
            'photos' => $profile['about']['photos'],
        ]);
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

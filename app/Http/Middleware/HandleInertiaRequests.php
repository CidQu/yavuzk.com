<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * Runs after SetLocale, so every translated string here is already in
     * the visitor's language.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => [
                'current' => app()->getLocale(),
                'label' => __('messages.language_label'),
                'action' => route('locale.update'),
                'options' => collect(config('profile.locales'))
                    ->map(fn (string $label, string $code) => ['code' => $code, 'label' => $label])
                    ->values()
                    ->all(),
            ],
            'navigation' => [
                [
                    'label' => __('messages.2md6j0g0'),
                    'href' => route('home'),
                    'active' => $request->routeIs('home'),
                ],
                [
                    'label' => __('messages.vo6pfazd'),
                    'href' => route('about'),
                    'active' => $request->routeIs('about'),
                ],
            ],
        ];
    }
}

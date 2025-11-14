<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }}@hasSection('title') · @yield('title')@endif</title>
    <link rel="icon" type="image/png" href="{{ asset('assets/images/cidqucoin.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    @unless (app()->environment('testing'))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @endunless
</head>
<body>
    <div class="app-shell">
        <header class="site-header">
            <a class="brand" href="{{ route('home') }}">
                <span class="brand__logo">{{ config('app.name') }}</span>
            </a>
            <nav class="site-nav">
                <a href="{{ route('home') }}" class="site-nav__link {{ request()->routeIs('home') ? 'is-active' : '' }}">{{ __('messages.2md6j0g0') }}</a>
                <a href="{{ route('about') }}" class="site-nav__link {{ request()->routeIs('about') ? 'is-active' : '' }}">{{ __('messages.vo6pfazd') }}</a>
            </nav>
        </header>
        <main class="page-container">
            @yield('content')
        </main>
        <footer class="site-footer">
            <div class="site-footer__content">
                <p>&copy; {{ now()->year }} {{ config('app.name') }}</p>
                @include('partials.language-switcher')
            </div>
        </footer>
    </div>
</body>
</html>

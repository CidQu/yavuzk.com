<!DOCTYPE html>
{{-- Dark by default: the backdrop is a chart of the coast at night. The theme
     toggle can switch to light, which takes the backdrop away. --}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="theme-color" content="#020618">
        <meta name="color-scheme" content="dark light">

        {{-- Apply a saved light theme before first paint to avoid a flash. --}}
        <script>
            (function () {
                var theme = null;
                try { theme = localStorage.getItem('theme'); } catch (e) {}
                document.documentElement.classList.toggle('dark', theme !== 'light');
            })();
        </script>

        <link rel="icon" type="image/png" href="{{ asset('assets/images/cidqucoin.png') }}">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>

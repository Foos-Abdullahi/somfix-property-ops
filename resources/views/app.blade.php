<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: #20201e;
            }
        </style>

        <link rel="icon" href="/favicon.ico?v=somfix-1" sizes="any">
        <link rel="icon" href="/favicon-32x32.png?v=somfix-1" type="image/png" sizes="32x32">
        <link rel="icon" href="/favicon.svg?v=somfix-1" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=somfix-1" sizes="180x180">
        <link rel="manifest" href="/site.webmanifest">
        <meta name="theme-color" content="#004317">
        <meta name="apple-mobile-web-app-title" content="SOMFIX">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'SOMFIX') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>

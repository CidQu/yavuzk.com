<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function show(Request $request): Response
    {
        $data = $request->validate([
            'path' => ['required', 'string'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $normalized = $this->normalizePath($data['path']);

        if (! str_starts_with($normalized, 'cidqu.net/')) {
            abort(404);
        }

        $source = 'https://nocors.api.cidqu.net/'.$normalized;

        $title = $data['title'] ?? __('messages.meurc5ww');
        $back = url()->previous();

        // The back button navigates client-side, so it must stay on this site.
        if (! $back || $back === $request->fullUrl() || parse_url($back, PHP_URL_HOST) !== $request->getHost()) {
            $back = route('home');
        }

        return Inertia::render('document', [
            'title' => $title,
            'source' => $source,
            'back' => [
                'label' => __('messages.2md6j0g0'),
                'href' => $back,
            ],
        ]);
    }

    private function normalizePath(string $path): string
    {
        $cleaned = preg_replace('#^https?://#', '', trim($path));

        return ltrim($cleaned, '/');
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

class DocumentController extends Controller
{
    public function show(Request $request): View
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

        if (! $back || $back === $request->fullUrl()) {
            $back = route('home');
        }

        return view('pages.document', [
            'title' => $title,
            'source' => $source,
            'backUrl' => $back,
        ]);
    }

    private function normalizePath(string $path): string
    {
        $cleaned = preg_replace('#^https?://#', '', trim($path));

        return ltrim($cleaned, '/');
    }
}

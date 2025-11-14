<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $supported = config('app.supported_locales', []);

        $validated = $request->validate([
            'locale' => ['required', Rule::in($supported)],
        ]);

        $request->session()->put('app_locale', $validated['locale']);

        return back();
    }
}

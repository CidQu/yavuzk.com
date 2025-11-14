@php($locales = config('profile.locales'))
<form action="{{ route('locale.update') }}" method="POST" class="language-switcher">
    @csrf
    <label class="language-switcher__label" for="language-selector">{{ __('messages.language_label') }}</label>
    <div class="language-switcher__control">
        <i class="fa-solid fa-globe"></i>
        <select id="language-selector" name="locale" data-language-select>
            @foreach($locales as $code => $label)
                <option value="{{ $code }}" @selected(app()->getLocale() === $code)>{{ $label }}</option>
            @endforeach
        </select>
    </div>
</form>

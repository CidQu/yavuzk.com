@extends('layouts.app')

@section('title', __('messages.2md6j0g0'))

@section('content')
<section class="hero">
    <div class="hero__media">
        <img src="{{ asset($heroImage) }}" alt="CidQu avatar" />
    </div>
    <div class="hero__content">
        <p class="hero__eyebrow">{{ __('messages.2zc38qby') }}</p>
        <h1 class="hero__title">{{ __('messages.uiwm9ux4') }}</h1>
        @if($nlNotice)
            <div class="callout">
                <strong>{{ $nlNotice['title'] }}</strong>
                <p>{{ $nlNotice['message'] }}</p>
            </div>
        @endif
        <div class="social-links">
            @foreach($socialLinks as $social)
                <a href="{{ $social['url'] }}" class="social-link" target="_blank" rel="noopener">
                    <span class="sr-only">{{ $social['label'] }}</span>
                    <i class="{{ $social['icon'] }}" aria-hidden="true"></i>
                </a>
            @endforeach
        </div>
    </div>
</section>
<section class="stats">
    <div class="stats-grid">
        @foreach($stats as $stat)
            <article class="stat-card">
                <div class="stat-card__icon">
                    <i class="{{ $stat['icon'] }}" aria-hidden="true"></i>
                </div>
                <p class="stat-card__label">{{ $stat['label'] }}</p>
                <p class="stat-card__value">
                    {{ $stat['value'] === null ? '—' : number_format($stat['value']) }}
                </p>
            </article>
        @endforeach
    </div>
</section>
<div class="divider"></div>
<section class="cta-grid">
    @foreach($ctaButtons as $button)
        <a href="{{ $button['url'] }}" class="btn" @if($button['is_external']) target="_blank" rel="noopener" @endif>
            {{ $button['label'] }}
        </a>
    @endforeach
</section>
@endsection

@extends('layouts.app')

@section('title', __('messages.mt2hlzom'))

@section('content')
<section class="about-hero">
    <div class="about-hero__media">
        <img src="{{ asset($profilePhoto) }}" alt="{{ __('messages.iaw9a94h') }}" />
    </div>
    <div class="about-hero__text">
        <p class="about-hero__eyebrow">{{ __('messages.mt2hlzom') }}</p>
        <h1>{{ __('messages.iaw9a94h') }}</h1>
    </div>
</section>
<section class="about-sections">
    @foreach($sections as $section)
        @php($body = __("messages.".$section['body_key']))
        <article class="about-section">
            <h2>{{ __("messages.".$section['title_key']) }}</h2>
            <p>{!! nl2br(e($body)) !!}</p>
        </article>
    @endforeach
</section>
<section class="photo-gallery" id="photos">
    <h2>{{ __('messages.ksc1h3vk') }}</h2>
    <p>{{ __('messages.0q0626om') }}</p>
    <div class="photo-grid">
        @foreach($photos as $photo)
            <button type="button" class="photo-thumb" data-photo-preview="{{ asset('assets/images/'.$photo) }}">
                <img src="{{ asset('assets/images/'.$photo) }}" alt="Gallery photo" />
            </button>
        @endforeach
    </div>
</section>
<div class="photo-modal" data-photo-modal hidden>
    <div class="photo-modal__backdrop" data-photo-dismiss></div>
    <div class="photo-modal__dialog">
        <button type="button" class="photo-modal__close" aria-label="Close" data-photo-dismiss>&times;</button>
        <img src="" alt="" data-photo-modal-image />
    </div>
</div>
@endsection

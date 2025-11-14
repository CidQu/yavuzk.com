@extends('layouts.app')

@section('title', $title)

@section('content')
<section class="document">
    <header class="document__header">
        <a href="{{ $backUrl }}" class="back-link">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
            <span>{{ __('messages.2md6j0g0') }}</span>
        </a>
        <h1>{{ $title }}</h1>
    </header>
    <div class="document__viewer">
        <iframe src="{{ $source }}" title="{{ $title }}" loading="lazy"></iframe>
    </div>
</section>
@endsection

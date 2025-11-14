<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/main', [PageController::class, 'home']);
Route::get('/hakkimda', [PageController::class, 'about'])->name('about');
Route::get('/documents', [DocumentController::class, 'show'])->name('documents.show');
Route::post('/locale', LocaleController::class)->name('locale.update');

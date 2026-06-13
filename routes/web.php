<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\PaymentRequestWebController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('/dashboard', DashboardController::class)
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/payment-requests/create', [PaymentRequestWebController::class, 'create'])->name('payment-requests.create');
    Route::get('/payment-requests/rate', [PaymentRequestWebController::class, 'rate'])->name('payment-requests.rate');
    Route::post('/payment-requests', [PaymentRequestWebController::class, 'store'])->name('payment-requests.store');
    Route::get('/payment-requests/{payment_request}', [PaymentRequestWebController::class, 'show'])->name('payment-requests.show');
    Route::patch('/payment-requests/{payment_request}/approve', [PaymentRequestWebController::class, 'approve'])->name('payment-requests.approve');
    Route::patch('/payment-requests/{payment_request}/reject', [PaymentRequestWebController::class, 'reject'])->name('payment-requests.reject');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

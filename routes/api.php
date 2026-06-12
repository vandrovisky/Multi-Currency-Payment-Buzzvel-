<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PaymentRequestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    });

    Route::middleware('auth:api')->group(function () {
        Route::get('user', fn (Request $request) => \App\Http\Resources\UserResource::make($request->user()));

        Route::post('payment-requests', [PaymentRequestController::class, 'store']);
        Route::get('payment-requests', [PaymentRequestController::class, 'index']);
        Route::get('payment-requests/{payment_request}', [PaymentRequestController::class, 'show']);
        Route::patch('payment-requests/{payment_request}/approve', [PaymentRequestController::class, 'approve']);
        Route::patch('payment-requests/{payment_request}/reject', [PaymentRequestController::class, 'reject']);
    });
});

<?php

use App\Models\PaymentRequest;
use App\Models\User;
use Laravel\Passport\Passport;

test('payment requests cannot be updated through the API', function (string $method) {
    $user = User::factory()->create();
    $paymentRequest = PaymentRequest::factory()->for($user)->create();
    Passport::actingAs($user, [], 'api');

    $status = $this->json($method, "/api/v1/payment-requests/{$paymentRequest->id}", [
        'amount_local' => 999999,
        'exchange_rate' => 1,
        'amount_eur' => 999999,
    ])->getStatusCode();

    // 404 while no route exists on the URI, 405 once GET show is added.
    expect($status)->toBeIn([404, 405]);

    expect($paymentRequest->refresh()->amount_local)->not->toBe('999999.00');
})->with(['PUT', 'PATCH']);

test('payment requests cannot be deleted through the API', function () {
    $user = User::factory()->create();
    $paymentRequest = PaymentRequest::factory()->for($user)->create();
    Passport::actingAs($user, [], 'api');

    $status = $this->deleteJson("/api/v1/payment-requests/{$paymentRequest->id}")
        ->getStatusCode();

    expect($status)->toBeIn([404, 405]);

    expect(PaymentRequest::count())->toBe(1);
});

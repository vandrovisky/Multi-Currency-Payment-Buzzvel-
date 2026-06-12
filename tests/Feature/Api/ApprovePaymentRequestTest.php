<?php

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use Laravel\Passport\Passport;

test('finance can approve a pending payment request', function () {
    $finance = User::factory()->finance()->create();
    $paymentRequest = PaymentRequest::factory()->create();

    Passport::actingAs($finance, [], 'api');

    $this->patchJson("/api/v1/payment-requests/{$paymentRequest->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $paymentRequest->refresh();
    expect($paymentRequest->status)->toBe(PaymentRequestStatus::Approved)
        ->and($paymentRequest->approved_by)->toBe($finance->id)
        ->and($paymentRequest->approved_at)->not->toBeNull();
});

test('finance can reject a pending payment request', function () {
    $finance = User::factory()->finance()->create();
    $paymentRequest = PaymentRequest::factory()->create();

    Passport::actingAs($finance, [], 'api');

    $this->patchJson("/api/v1/payment-requests/{$paymentRequest->id}/reject")
        ->assertOk()
        ->assertJsonPath('data.status', 'rejected');

    expect($paymentRequest->refresh()->status)->toBe(PaymentRequestStatus::Rejected);
});

test('employees cannot approve or reject', function (string $action) {
    $paymentRequest = PaymentRequest::factory()->create();

    Passport::actingAs(User::factory()->create(), [], 'api');

    $this->patchJson("/api/v1/payment-requests/{$paymentRequest->id}/{$action}")
        ->assertForbidden();

    expect($paymentRequest->refresh()->status)->toBe(PaymentRequestStatus::Pending);
})->with(['approve', 'reject']);

test('a non-pending request cannot transition again', function (string $factoryState, string $action) {
    $paymentRequest = PaymentRequest::factory()->{$factoryState}()->create();

    Passport::actingAs(User::factory()->finance()->create(), [], 'api');

    $this->patchJson("/api/v1/payment-requests/{$paymentRequest->id}/{$action}")
        ->assertStatus(409)
        ->assertJsonStructure(['message']);
})->with([
    'approved -> approve' => ['approved', 'approve'],
    'approved -> reject' => ['approved', 'reject'],
    'rejected -> approve' => ['rejected', 'approve'],
    'expired -> approve' => ['expired', 'approve'],
    'expired -> reject' => ['expired', 'reject'],
]);

test('approving preserves the original exchange rate and amounts', function () {
    $paymentRequest = PaymentRequest::factory()->create([
        'exchange_rate' => 6.15,
        'amount_local' => 615,
        'amount_eur' => 100,
    ]);

    Passport::actingAs(User::factory()->finance()->create(), [], 'api');

    $this->patchJson("/api/v1/payment-requests/{$paymentRequest->id}/approve")->assertOk();

    $paymentRequest->refresh();
    expect($paymentRequest->exchange_rate)->toBe('6.15000000')
        ->and($paymentRequest->amount_eur)->toBe('100.00');
});

test('guests cannot approve', function () {
    $paymentRequest = PaymentRequest::factory()->create();

    $this->patchJson("/api/v1/payment-requests/{$paymentRequest->id}/approve")
        ->assertUnauthorized();
});

<?php

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;

test('payment request belongs to a user and has typed casts', function () {
    $request = PaymentRequest::factory()->create();

    expect($request->user)->toBeInstanceOf(User::class)
        ->and($request->status)->toBeInstanceOf(PaymentRequestStatus::class)
        ->and($request->amount_local)->toBeString() // decimal cast keeps precision as string
        ->and($request->exchange_rate)->toBeString()
        ->and($request->rate_fetched_at)->toBeInstanceOf(DateTimeInterface::class);
});

test('factory states produce each status', function () {
    expect(PaymentRequest::factory()->create()->status)->toBe(PaymentRequestStatus::Pending)
        ->and(PaymentRequest::factory()->approved()->create()->status)->toBe(PaymentRequestStatus::Approved)
        ->and(PaymentRequest::factory()->rejected()->create()->status)->toBe(PaymentRequestStatus::Rejected)
        ->and(PaymentRequest::factory()->expired()->create()->status)->toBe(PaymentRequestStatus::Expired);
});

test('approved state records approver and timestamp', function () {
    $request = PaymentRequest::factory()->approved()->create();

    expect($request->approver)->toBeInstanceOf(User::class)
        ->and($request->approved_at)->not->toBeNull();
});

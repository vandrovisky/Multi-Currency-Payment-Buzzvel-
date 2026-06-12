<?php

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use Illuminate\Support\Facades\Schedule;

test('expires pending requests older than 48 hours', function () {
    $stale = PaymentRequest::factory()->create();
    $fresh = PaymentRequest::factory()->create();

    // Make $stale 49h old without touching $fresh.
    $stale->forceFill(['created_at' => now()->subHours(49)])->save();

    $this->artisan('payment-requests:expire-stale')
        ->expectsOutputToContain('1')
        ->assertSuccessful();

    expect($stale->refresh()->status)->toBe(PaymentRequestStatus::Expired)
        ->and($fresh->refresh()->status)->toBe(PaymentRequestStatus::Pending);
});

test('requests exactly at the 48 hour boundary are not expired', function () {
    $boundary = PaymentRequest::factory()->create();
    $boundary->forceFill(['created_at' => now()->subHours(48)])->save();

    $this->artisan('payment-requests:expire-stale')->assertSuccessful();

    expect($boundary->refresh()->status)->toBe(PaymentRequestStatus::Pending);
});

test('approved and rejected requests are never expired', function () {
    $approved = PaymentRequest::factory()->approved()->create();
    $rejected = PaymentRequest::factory()->rejected()->create();
    $approved->forceFill(['created_at' => now()->subDays(10)])->save();
    $rejected->forceFill(['created_at' => now()->subDays(10)])->save();

    $this->artisan('payment-requests:expire-stale')->assertSuccessful();

    expect($approved->refresh()->status)->toBe(PaymentRequestStatus::Approved)
        ->and($rejected->refresh()->status)->toBe(PaymentRequestStatus::Rejected);
});

test('the command works with time travel', function () {
    $request = PaymentRequest::factory()->create();

    $this->travelTo(now()->addHours(49));

    $this->artisan('payment-requests:expire-stale')->assertSuccessful();

    expect($request->refresh()->status)->toBe(PaymentRequestStatus::Expired);
});

test('the command is scheduled hourly', function () {
    $scheduled = collect(Schedule::events())
        ->filter(fn ($event) => str_contains($event->command ?? '', 'payment-requests:expire-stale'));

    expect($scheduled)->toHaveCount(1)
        ->and($scheduled->first()->expression)->toBe('0 * * * *');
});

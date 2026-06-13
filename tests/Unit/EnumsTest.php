<?php

use App\Enums\PaymentRequestStatus;
use App\Enums\UserRole;

test('user roles have the expected backing values', function () {
    expect(UserRole::Employee->value)->toBe('employee')
        ->and(UserRole::Finance->value)->toBe('finance')
        ->and(UserRole::cases())->toHaveCount(2);
});

test('payment request statuses cover the full lifecycle', function () {
    expect(collect(PaymentRequestStatus::cases())->map->value->all())
        ->toBe(['pending', 'approved', 'rejected', 'expired']);
});

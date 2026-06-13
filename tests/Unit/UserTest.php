<?php

use App\Enums\UserRole;
use App\Models\User;

test('isFinance is true only for finance users', function () {
    $finance = new User(['role' => UserRole::Finance]);
    $employee = new User(['role' => UserRole::Employee]);

    expect($finance->isFinance())->toBeTrue()
        ->and($employee->isFinance())->toBeFalse();
});

test('the role attribute is cast to the UserRole enum', function () {
    $user = new User(['role' => 'finance']);

    expect($user->role)->toBe(UserRole::Finance);
});

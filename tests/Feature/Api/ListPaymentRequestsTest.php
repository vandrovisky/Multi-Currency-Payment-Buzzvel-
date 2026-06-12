<?php

use App\Models\PaymentRequest;
use App\Models\User;
use Laravel\Passport\Passport;

test('employees only see their own payment requests', function () {
    $employee = User::factory()->create();
    PaymentRequest::factory()->count(2)->for($employee)->create();
    PaymentRequest::factory()->count(3)->create(); // other users

    Passport::actingAs($employee, [], 'api');

    $this->getJson('/api/v1/payment-requests')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('finance users see all payment requests', function () {
    PaymentRequest::factory()->count(3)->create();

    Passport::actingAs(User::factory()->finance()->create(), [], 'api');

    $this->getJson('/api/v1/payment-requests')
        ->assertOk()
        ->assertJsonCount(3, 'data');
});

test('list can be filtered by status', function () {
    $finance = User::factory()->finance()->create();
    PaymentRequest::factory()->count(2)->create();
    PaymentRequest::factory()->approved()->create();

    Passport::actingAs($finance, [], 'api');

    $this->getJson('/api/v1/payment-requests?status=approved')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.status', 'approved');
});

test('invalid status filter is rejected', function () {
    Passport::actingAs(User::factory()->create(), [], 'api');

    $this->getJson('/api/v1/payment-requests?status=bogus')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['status']);
});

test('list is paginated', function () {
    Passport::actingAs(User::factory()->finance()->create(), [], 'api');
    PaymentRequest::factory()->count(3)->create();

    $this->getJson('/api/v1/payment-requests?per_page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure(['data', 'links', 'meta']);
});

test('owner can view their payment request detail', function () {
    $employee = User::factory()->create();
    $paymentRequest = PaymentRequest::factory()->for($employee)->create();

    Passport::actingAs($employee, [], 'api');

    $this->getJson("/api/v1/payment-requests/{$paymentRequest->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $paymentRequest->id);
});

test('finance can view any payment request detail', function () {
    $paymentRequest = PaymentRequest::factory()->create();

    Passport::actingAs(User::factory()->finance()->create(), [], 'api');

    $this->getJson("/api/v1/payment-requests/{$paymentRequest->id}")
        ->assertOk();
});

test('an employee cannot view another user\'s payment request', function () {
    $paymentRequest = PaymentRequest::factory()->create();

    Passport::actingAs(User::factory()->create(), [], 'api');

    $this->getJson("/api/v1/payment-requests/{$paymentRequest->id}")
        ->assertForbidden();
});

test('guests cannot list payment requests', function () {
    $this->getJson('/api/v1/payment-requests')->assertUnauthorized();
});

<?php

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Http::fake([
        'api.exchangerate-api.com/*' => Http::response([
            'base' => 'EUR',
            'rates' => ['EUR' => 1, 'BRL' => 6.15],
        ]),
    ]);
});

test('create form page renders', function () {
    $this->actingAs(User::factory()->create())
        ->get('/payment-requests/create')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('PaymentRequests/Create'));
});

test('rate endpoint returns the user currency rate', function () {
    $this->actingAs(User::factory()->create(['currency' => 'BRL']))
        ->getJson('/payment-requests/rate')
        ->assertOk()
        ->assertJson(['currency' => 'BRL', 'rate' => 6.15]);
});

test('submitting the form creates a request and redirects to its page', function () {
    $user = User::factory()->create(['currency' => 'BRL']);

    $this->actingAs($user)
        ->post('/payment-requests', [
            'description' => 'Team dinner',
            'amount_local' => 615,
        ])
        ->assertRedirect();

    $request = PaymentRequest::sole();
    expect($request->amount_eur)->toBe('100.00')
        ->and($request->user_id)->toBe($user->id);
});

test('show page renders for the owner', function () {
    $user = User::factory()->create();
    $paymentRequest = PaymentRequest::factory()->for($user)->create();

    $this->actingAs($user)
        ->get("/payment-requests/{$paymentRequest->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('PaymentRequests/Show')
            ->where('paymentRequest.data.id', $paymentRequest->id));
});

test('show page is forbidden for other employees', function () {
    $paymentRequest = PaymentRequest::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get("/payment-requests/{$paymentRequest->id}")
        ->assertForbidden();
});

test('finance can approve from the web', function () {
    $paymentRequest = PaymentRequest::factory()->create();

    $this->actingAs(User::factory()->finance()->create())
        ->patch("/payment-requests/{$paymentRequest->id}/approve")
        ->assertRedirect();

    expect($paymentRequest->refresh()->status)->toBe(PaymentRequestStatus::Approved);
});

test('employees cannot approve from the web', function () {
    $paymentRequest = PaymentRequest::factory()->create();

    $this->actingAs(User::factory()->create())
        ->patch("/payment-requests/{$paymentRequest->id}/approve")
        ->assertForbidden();
});

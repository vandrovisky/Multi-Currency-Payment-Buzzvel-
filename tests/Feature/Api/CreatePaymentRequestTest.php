<?php

use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Passport\Passport;

function fakeFx(array $rates = ['EUR' => 1, 'BRL' => 6.15, 'USD' => 1.08]): void
{
    Http::fake([
        'api.exchangerate-api.com/*' => Http::response([
            'base' => 'EUR',
            'rates' => $rates,
        ]),
    ]);
}

test('creates a payment request in the user currency with the fetched rate', function () {
    fakeFx();
    $user = User::factory()->create(['currency' => 'BRL']);
    Passport::actingAs($user, [], 'api');

    $response = $this->postJson('/api/v1/payment-requests', [
        'description' => 'Team offsite dinner',
        'amount_local' => 615.00,
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.currency', 'BRL')
        ->assertJsonPath('data.amount_local', '615.00')
        ->assertJsonPath('data.exchange_rate', '6.15000000')
        ->assertJsonPath('data.amount_eur', '100.00')
        ->assertJsonPath('data.status', 'pending')
        ->assertJsonPath('data.rate_source', 'exchangerate-api.com');

    expect(PaymentRequest::sole()->user_id)->toBe($user->id);
});

test('currency always comes from the user, not the payload', function () {
    fakeFx();
    Passport::actingAs(User::factory()->create(['currency' => 'USD']), [], 'api');

    $this->postJson('/api/v1/payment-requests', [
        'description' => 'Conference tickets',
        'amount_local' => 108,
        'currency' => 'BRL', // must be ignored
    ])->assertCreated()
        ->assertJsonPath('data.currency', 'USD')
        ->assertJsonPath('data.amount_eur', '100.00');
});

test('validates description and amount', function (array $payload, string $field) {
    fakeFx();
    Passport::actingAs(User::factory()->create(), [], 'api');

    $this->postJson('/api/v1/payment-requests', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors([$field]);
})->with([
    'missing description' => [['amount_local' => 100], 'description'],
    'missing amount' => [['description' => 'Lunch'], 'amount_local'],
    'zero amount' => [['description' => 'Lunch', 'amount_local' => 0], 'amount_local'],
    'negative amount' => [['description' => 'Lunch', 'amount_local' => -5], 'amount_local'],
    'non numeric amount' => [['description' => 'Lunch', 'amount_local' => 'abc'], 'amount_local'],
]);

test('returns 503 and stores nothing when the FX API is down', function () {
    Http::fake(['api.exchangerate-api.com/*' => Http::response(null, 500)]);
    Passport::actingAs(User::factory()->create(), [], 'api');

    $this->postJson('/api/v1/payment-requests', [
        'description' => 'Lunch',
        'amount_local' => 100,
    ])->assertStatus(503)
        ->assertJsonStructure(['message']);

    expect(PaymentRequest::count())->toBe(0);
});

test('returns 422 when the user currency is not supported by the provider', function () {
    fakeFx(['EUR' => 1]);
    Passport::actingAs(User::factory()->create(['currency' => 'BRL']), [], 'api');

    $this->postJson('/api/v1/payment-requests', [
        'description' => 'Lunch',
        'amount_local' => 100,
    ])->assertUnprocessable();

    expect(PaymentRequest::count())->toBe(0);
});

test('guests cannot create payment requests', function () {
    $this->postJson('/api/v1/payment-requests', [
        'description' => 'Lunch',
        'amount_local' => 100,
    ])->assertUnauthorized();
});

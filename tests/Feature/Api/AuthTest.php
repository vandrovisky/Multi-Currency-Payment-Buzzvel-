<?php

use App\Models\User;

test('user can register and receives a token', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Ana Souza',
        'email' => 'ana@example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
        'country' => 'BR',
        'currency' => 'BRL',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'role', 'country', 'currency'], 'token'])
        ->assertJsonPath('data.role', 'employee')
        ->assertJsonPath('data.currency', 'BRL');

    expect(User::whereEmail('ana@example.com')->exists())->toBeTrue();
});

test('registration validates required fields', function () {
    $this->postJson('/api/v1/auth/register', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'password', 'country', 'currency']);
});

test('registration rejects invalid country and currency codes', function () {
    $this->postJson('/api/v1/auth/register', [
        'name' => 'Ana',
        'email' => 'ana@example.com',
        'password' => 'secret-password',
        'password_confirmation' => 'secret-password',
        'country' => 'Brazil',
        'currency' => 'reais',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['country', 'currency']);
});

test('user can login with valid credentials', function () {
    $user = User::factory()->create(['password' => 'secret-password']);

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'secret-password',
    ])->assertOk()
        ->assertJsonStructure(['data', 'token']);
});

test('login fails with wrong password', function () {
    $user = User::factory()->create(['password' => 'secret-password']);

    $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('authenticated user can logout and token is revoked', function () {
    $user = User::factory()->create(['password' => 'secret-password']);

    $token = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'secret-password',
    ])->json('token');

    $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();

    // Each HTTP test request reuses the same guard instance, which caches the
    // resolved user; reset it so the next call re-validates the token.
    app('auth')->forgetGuards();

    $this->withToken($token)->getJson('/api/v1/user')->assertUnauthorized();
});

test('guest cannot logout', function () {
    $this->postJson('/api/v1/auth/logout')->assertUnauthorized();
});

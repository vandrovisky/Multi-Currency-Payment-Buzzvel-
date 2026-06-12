<?php

use App\Models\PaymentRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('dashboard shows the employee their own requests only', function () {
    $employee = User::factory()->create();
    PaymentRequest::factory()->count(2)->for($employee)->create();
    PaymentRequest::factory()->create();

    $this->actingAs($employee)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard')
            ->has('paymentRequests.data', 2)
        );
});

test('dashboard shows finance users every request', function () {
    PaymentRequest::factory()->count(3)->create();

    $this->actingAs(User::factory()->finance()->create())
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('paymentRequests.data', 3)
        );
});

test('dashboard filters by status', function () {
    $employee = User::factory()->create();
    PaymentRequest::factory()->for($employee)->create();
    PaymentRequest::factory()->approved()->for($employee)->create();

    $this->actingAs($employee)
        ->get('/dashboard?status=approved')
        ->assertInertia(fn (Assert $page) => $page
            ->has('paymentRequests.data', 1)
            ->where('paymentRequests.data.0.status', 'approved')
            ->where('filters.status', 'approved')
        );
});

test('guests are redirected to login', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

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

test('dashboard searches by description', function () {
    $employee = User::factory()->create();
    PaymentRequest::factory()->for($employee)->create(['description' => 'Conference tickets']);
    PaymentRequest::factory()->for($employee)->create(['description' => 'Team dinner']);

    $this->actingAs($employee)
        ->get('/dashboard?search=conference')
        ->assertInertia(fn (Assert $page) => $page
            ->has('paymentRequests.data', 1)
            ->where('paymentRequests.data.0.description', 'Conference tickets')
            ->where('filters.search', 'conference')
        );
});

test('finance can search by the requester name', function () {
    $alice = User::factory()->create(['name' => 'Alice Approver']);
    $bob = User::factory()->create(['name' => 'Bob Builder']);
    PaymentRequest::factory()->for($alice)->create(['description' => 'A']);
    PaymentRequest::factory()->for($bob)->create(['description' => 'B']);

    $this->actingAs(User::factory()->finance()->create())
        ->get('/dashboard?search=builder')
        ->assertInertia(fn (Assert $page) => $page
            ->has('paymentRequests.data', 1)
            ->where('paymentRequests.data.0.description', 'B')
        );
});

test('employees cannot find other users requests via search', function () {
    $employee = User::factory()->create();
    PaymentRequest::factory()->create(['description' => 'Secret offsite']);

    $this->actingAs($employee)
        ->get('/dashboard?search=secret')
        ->assertInertia(fn (Assert $page) => $page->has('paymentRequests.data', 0));
});

test('search and status filter combine', function () {
    $employee = User::factory()->create();
    PaymentRequest::factory()->for($employee)->create(['description' => 'Laptop', 'status' => 'pending']);
    PaymentRequest::factory()->approved()->for($employee)->create(['description' => 'Laptop']);

    $this->actingAs($employee)
        ->get('/dashboard?search=laptop&status=pending')
        ->assertInertia(fn (Assert $page) => $page->has('paymentRequests.data', 1)
            ->where('paymentRequests.data.0.status', 'pending'));
});

test('guests are redirected to login', function () {
    $this->get('/dashboard')->assertRedirect('/login');
});

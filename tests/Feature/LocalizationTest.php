<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('locale and translations are shared with every inertia page', function () {
    $this->actingAs(User::factory()->create())
        ->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'en')
            ->has('translations')
            ->where('translations.Dashboard', 'Dashboard')
        );
});

test('the locale can be switched and persists in the session', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/locale', ['locale' => 'pt_BR'])
        ->assertRedirect();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('locale', 'pt_BR')
            ->where('translations.Dashboard', 'Painel')
        );
});

test('unsupported locales are rejected', function () {
    $this->actingAs(User::factory()->create())
        ->post('/locale', ['locale' => 'xx'])
        ->assertSessionHasErrors('locale');
});

test('guests can also switch locale', function () {
    $this->post('/locale', ['locale' => 'pt_BR'])->assertRedirect();

    $this->get('/login')
        ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt_BR'));
});

<?php

use App\Services\ExchangeRate\ExchangeRate;

test('it is an immutable snapshot of a rate', function () {
    $fetchedAt = new DateTimeImmutable('2026-06-13T10:00:00Z');

    $rate = new ExchangeRate(
        currency: 'BRL',
        rate: 6.15,
        source: 'exchangerate-api.com',
        fetchedAt: $fetchedAt,
    );

    expect($rate->currency)->toBe('BRL')
        ->and($rate->rate)->toBe(6.15)
        ->and($rate->source)->toBe('exchangerate-api.com')
        ->and($rate->fetchedAt)->toBe($fetchedAt);
});

test('its properties are readonly', function () {
    $rate = new ExchangeRate('USD', 1.08, 'exchangerate-api.com', new DateTimeImmutable);

    $rate->rate = 2.0;
})->throws(Error::class);

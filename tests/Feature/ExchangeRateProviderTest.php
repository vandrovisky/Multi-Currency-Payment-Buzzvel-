<?php

use App\Exceptions\ExchangeRateUnavailableException;
use App\Exceptions\UnsupportedCurrencyException;
use App\Services\ExchangeRate\ExchangeRateApiProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

function fakeRatesResponse(array $rates = ['EUR' => 1, 'BRL' => 6.15, 'USD' => 1.08]): void
{
    Http::fake([
        'api.exchangerate-api.com/*' => Http::response([
            'base' => 'EUR',
            'date' => '2026-06-12',
            'rates' => $rates,
        ]),
    ]);
}

beforeEach(fn () => Cache::flush());

test('fetches the EUR rate for a currency', function () {
    fakeRatesResponse();

    $rate = app(ExchangeRateApiProvider::class)->getRate('BRL');

    expect($rate->rate)->toBe(6.15)
        ->and($rate->currency)->toBe('BRL')
        ->and($rate->source)->toBe('exchangerate-api.com')
        ->and($rate->fetchedAt)->toBeInstanceOf(DateTimeInterface::class);
});

test('caches rates for subsequent calls', function () {
    fakeRatesResponse();

    $provider = app(ExchangeRateApiProvider::class);
    $provider->getRate('BRL');
    $provider->getRate('USD');

    Http::assertSentCount(1);
});

test('throws when currency is not supported by the provider', function () {
    fakeRatesResponse(['EUR' => 1]);

    app(ExchangeRateApiProvider::class)->getRate('XYZ');
})->throws(UnsupportedCurrencyException::class);

test('throws when the FX API returns an error', function () {
    Http::fake(['api.exchangerate-api.com/*' => Http::response(null, 500)]);

    app(ExchangeRateApiProvider::class)->getRate('BRL');
})->throws(ExchangeRateUnavailableException::class);

test('throws when the FX API is unreachable', function () {
    Http::fake(fn () => throw new \Illuminate\Http\Client\ConnectionException('timeout'));

    app(ExchangeRateApiProvider::class)->getRate('BRL');
})->throws(ExchangeRateUnavailableException::class);

test('failed responses are not cached', function () {
    Http::fake([
        'api.exchangerate-api.com/*' => Http::sequence()
            ->push(null, 500)
            ->push(['base' => 'EUR', 'rates' => ['BRL' => 6.15]]),
    ]);

    $provider = app(ExchangeRateApiProvider::class);

    try {
        $provider->getRate('BRL');
    } catch (ExchangeRateUnavailableException) {
        // expected
    }

    expect($provider->getRate('BRL')->rate)->toBe(6.15);
});

<?php

namespace App\Services\ExchangeRate;

use App\Exceptions\ExchangeRateUnavailableException;
use App\Exceptions\UnsupportedCurrencyException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ExchangeRateApiProvider implements ExchangeRateProvider
{
    private const SOURCE = 'exchangerate-api.com';

    private const CACHE_KEY = 'exchange-rates:eur';

    private const CACHE_TTL_SECONDS = 300;

    public function getRate(string $currency): ExchangeRate
    {
        $rates = Cache::remember(
            self::CACHE_KEY,
            self::CACHE_TTL_SECONDS,
            fn (): array => $this->fetchRates(),
        );

        if (! isset($rates[$currency])) {
            throw new UnsupportedCurrencyException($currency);
        }

        return new ExchangeRate(
            currency: $currency,
            rate: (float) $rates[$currency],
            source: self::SOURCE,
            fetchedAt: now(),
        );
    }

    /**
     * @return array<string, float>
     *
     * @throws ExchangeRateUnavailableException
     */
    private function fetchRates(): array
    {
        try {
            $response = Http::timeout(5)
                ->retry(2, 200, throw: false)
                ->get(config('services.exchange_rate.url'));
        } catch (ConnectionException) {
            throw new ExchangeRateUnavailableException;
        }

        if ($response->failed() || ! is_array($response->json('rates'))) {
            throw new ExchangeRateUnavailableException;
        }

        return $response->json('rates');
    }
}

<?php

namespace App\Services\ExchangeRate;

use App\Exceptions\ExchangeRateUnavailableException;
use App\Exceptions\UnsupportedCurrencyException;

interface ExchangeRateProvider
{
    /**
     * Get the current EUR -> $currency exchange rate.
     *
     * @throws ExchangeRateUnavailableException when the provider cannot be reached
     * @throws UnsupportedCurrencyException when the currency is unknown to the provider
     */
    public function getRate(string $currency): ExchangeRate;
}

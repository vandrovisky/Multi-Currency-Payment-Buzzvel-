<?php

namespace App\Services\ExchangeRate;

use DateTimeInterface;

/**
 * Immutable snapshot of an EUR -> currency exchange rate.
 */
readonly class ExchangeRate
{
    public function __construct(
        public string $currency,
        public float $rate,
        public string $source,
        public DateTimeInterface $fetchedAt,
    ) {}
}

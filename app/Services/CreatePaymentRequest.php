<?php

namespace App\Services;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use App\Services\ExchangeRate\ExchangeRateProvider;

class CreatePaymentRequest
{
    public function __construct(
        private readonly ExchangeRateProvider $exchangeRates,
    ) {}

    /**
     * Create a pending payment request in the user's local currency,
     * snapshotting the EUR exchange rate at creation time.
     */
    public function handle(User $user, string $description, float $amountLocal): PaymentRequest
    {
        $rate = $this->exchangeRates->getRate($user->currency);

        return PaymentRequest::create([
            'user_id' => $user->id,
            'description' => $description,
            'amount_local' => $amountLocal,
            'currency' => $user->currency,
            'exchange_rate' => $rate->rate,
            'amount_eur' => round($amountLocal / $rate->rate, 2),
            'rate_source' => $rate->source,
            'rate_fetched_at' => $rate->fetchedAt,
            'status' => PaymentRequestStatus::Pending,
        ]);
    }
}

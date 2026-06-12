<?php

namespace Database\Factories;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PaymentRequest>
 */
class PaymentRequestFactory extends Factory
{
    public function definition(): array
    {
        $amountLocal = fake()->randomFloat(2, 10, 5000);
        $exchangeRate = fake()->randomFloat(8, 0.5, 200); // EUR -> local currency

        return [
            'user_id' => User::factory(),
            'description' => fake()->sentence(4),
            'amount_local' => $amountLocal,
            'currency' => 'BRL',
            'exchange_rate' => $exchangeRate,
            'amount_eur' => round($amountLocal / $exchangeRate, 2),
            'rate_source' => 'exchangerate-api.com',
            'rate_fetched_at' => now(),
            'status' => PaymentRequestStatus::Pending,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => PaymentRequestStatus::Approved,
            'approved_by' => User::factory()->finance(),
            'approved_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => PaymentRequestStatus::Rejected,
            'approved_by' => User::factory()->finance(),
            'approved_at' => now(),
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn () => [
            'status' => PaymentRequestStatus::Expired,
            'created_at' => now()->subDays(3),
        ]);
    }
}

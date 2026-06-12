<?php

namespace Database\Seeders;

use App\Models\PaymentRequest;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Approximate EUR -> local currency rates used for demo data only;
     * real requests always fetch live rates at creation time.
     */
    private const DEMO_RATES = [
        'BRL' => 6.15,
        'USD' => 1.08,
        'EUR' => 1.0,
        'JPY' => 169.5,
        'GBP' => 0.85,
    ];

    public function run(): void
    {
        $finance = User::factory()->finance()->create([
            'name' => 'Fiona Finance',
            'email' => 'finance@example.com',
            'country' => 'PT',
            'currency' => 'EUR',
        ]);

        $employees = collect([
            ['name' => 'Bruna Silva', 'email' => 'bruna@example.com', 'country' => 'BR', 'currency' => 'BRL'],
            ['name' => 'Alex Johnson', 'email' => 'alex@example.com', 'country' => 'US', 'currency' => 'USD'],
            ['name' => 'Tiago Costa', 'email' => 'tiago@example.com', 'country' => 'PT', 'currency' => 'EUR'],
            ['name' => 'Yuki Tanaka', 'email' => 'yuki@example.com', 'country' => 'JP', 'currency' => 'JPY'],
            ['name' => 'Olivia Brown', 'email' => 'olivia@example.com', 'country' => 'GB', 'currency' => 'GBP'],
        ])->map(fn (array $attributes) => User::factory()->create($attributes));

        $employees->each(function (User $employee) use ($finance) {
            $this->paymentRequestFor($employee)->create();

            $this->paymentRequestFor($employee)->approved()->create([
                'approved_by' => $finance->id,
            ]);

            $this->paymentRequestFor($employee)->rejected()->create([
                'approved_by' => $finance->id,
            ]);

            $this->paymentRequestFor($employee)->expired()->create();
        });
    }

    private function paymentRequestFor(User $employee)
    {
        $rate = self::DEMO_RATES[$employee->currency];
        $amountLocal = fake()->randomFloat(2, 50, 3000);

        return PaymentRequest::factory()
            ->for($employee)
            ->state([
                'currency' => $employee->currency,
                'exchange_rate' => $rate,
                'amount_local' => $amountLocal,
                'amount_eur' => round($amountLocal / $rate, 2),
            ]);
    }
}

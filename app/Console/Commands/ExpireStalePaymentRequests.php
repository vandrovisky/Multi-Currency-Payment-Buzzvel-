<?php

namespace App\Console\Commands;

use App\Enums\PaymentRequestStatus;
use App\Models\PaymentRequest;
use Illuminate\Console\Command;

class ExpireStalePaymentRequests extends Command
{
    protected $signature = 'payment-requests:expire-stale';

    protected $description = 'Mark payment requests pending for more than 48 hours as expired';

    public function handle(): int
    {
        $expired = PaymentRequest::query()
            ->where('status', PaymentRequestStatus::Pending)
            ->where('created_at', '<', now()->subHours(48))
            ->update(['status' => PaymentRequestStatus::Expired]);

        $this->info("Expired {$expired} stale payment request(s).");

        return self::SUCCESS;
    }
}

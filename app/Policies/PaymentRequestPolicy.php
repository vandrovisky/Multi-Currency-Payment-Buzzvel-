<?php

namespace App\Policies;

use App\Models\PaymentRequest;
use App\Models\User;

class PaymentRequestPolicy
{
    /**
     * Finance sees everything; employees only their own requests.
     */
    public function view(User $user, PaymentRequest $paymentRequest): bool
    {
        return $user->isFinance() || $paymentRequest->user_id === $user->id;
    }

    /**
     * Only finance users can approve or reject.
     */
    public function decide(User $user, PaymentRequest $paymentRequest): bool
    {
        return $user->isFinance();
    }
}

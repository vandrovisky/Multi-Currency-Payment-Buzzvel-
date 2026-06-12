<?php

namespace App\Services;

use App\Enums\PaymentRequestStatus;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\PaymentRequest;
use App\Models\User;

class DecidePaymentRequest
{
    /**
     * Approve or reject a pending payment request.
     *
     * @throws InvalidStatusTransitionException when the request is no longer pending
     */
    public function handle(PaymentRequest $paymentRequest, User $decidedBy, PaymentRequestStatus $decision): PaymentRequest
    {
        if (! $paymentRequest->isPending()) {
            throw new InvalidStatusTransitionException($paymentRequest->status, $decision);
        }

        $paymentRequest->forceFill([
            'status' => $decision,
            'approved_by' => $decidedBy->id,
            'approved_at' => now(),
        ])->save();

        return $paymentRequest;
    }
}

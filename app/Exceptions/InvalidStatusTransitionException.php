<?php

namespace App\Exceptions;

use App\Enums\PaymentRequestStatus;
use Exception;

class InvalidStatusTransitionException extends Exception
{
    public function __construct(PaymentRequestStatus $from, PaymentRequestStatus $to)
    {
        parent::__construct(
            "Cannot transition a payment request from [{$from->value}] to [{$to->value}]; only pending requests can be decided."
        );
    }
}

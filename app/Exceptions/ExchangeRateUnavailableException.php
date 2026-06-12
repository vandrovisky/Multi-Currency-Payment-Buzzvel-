<?php

namespace App\Exceptions;

use Exception;

class ExchangeRateUnavailableException extends Exception
{
    public function __construct(string $message = 'The exchange rate service is currently unavailable. Please try again later.')
    {
        parent::__construct($message);
    }
}

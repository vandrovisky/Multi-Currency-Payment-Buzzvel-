<?php

namespace App\Exceptions;

use Exception;

class UnsupportedCurrencyException extends Exception
{
    public function __construct(string $currency)
    {
        parent::__construct("The currency [{$currency}] is not supported by the exchange rate provider.");
    }
}

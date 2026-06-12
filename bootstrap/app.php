<?php

use App\Exceptions\ExchangeRateUnavailableException;
use App\Exceptions\InvalidStatusTransitionException;
use App\Exceptions\UnsupportedCurrencyException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(fn (ExchangeRateUnavailableException $e) => response()->json(
            ['message' => $e->getMessage()],
            503,
        ));

        $exceptions->render(fn (InvalidStatusTransitionException $e) => response()->json(
            ['message' => $e->getMessage()],
            409,
        ));

        $exceptions->render(fn (UnsupportedCurrencyException $e) => response()->json(
            ['message' => $e->getMessage()],
            422,
        ));
    })->create();

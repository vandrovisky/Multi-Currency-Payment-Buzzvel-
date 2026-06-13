<?php

namespace App\Providers;

use App\Services\ExchangeRate\ExchangeRateApiProvider;
use App\Services\ExchangeRate\ExchangeRateProvider;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\Generator\SecurityRequirement;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Dedoc\Scramble\Support\RouteInfo;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(ExchangeRateProvider::class, ExchangeRateApiProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->configureApiDocs();
    }

    /**
     * Describe the Bearer (Passport) auth in the generated OpenAPI document and
     * apply it only to routes guarded by an `auth:` middleware.
     */
    private function configureApiDocs(): void
    {
        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi) {
                $openApi->info->version = '1.0.0';
                $openApi->info->setDescription(
                    'REST API for the multi-currency payment request service. '
                    .'Authenticate via `POST /api/v1/auth/login` to obtain a Bearer token, '
                    .'then send it as `Authorization: Bearer <token>`.'
                );

                $openApi->components->addSecurityScheme(
                    'bearerAuth',
                    SecurityScheme::http('bearer'),
                );
            })
            ->withOperationTransformers(function (Operation $operation, RouteInfo $routeInfo) {
                $isProtected = collect($routeInfo->route->gatherMiddleware())
                    ->contains(fn ($middleware) => is_string($middleware) && str_starts_with($middleware, 'auth:'));

                if ($isProtected) {
                    $operation->addSecurity(new SecurityRequirement(['bearerAuth' => []]));
                }
            });
    }
}

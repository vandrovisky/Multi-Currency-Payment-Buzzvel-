<?php

namespace App\Http\Controllers;

use App\Enums\PaymentRequestStatus;
use App\Http\Requests\Api\StorePaymentRequestRequest;
use App\Http\Resources\PaymentRequestResource;
use App\Models\PaymentRequest;
use App\Services\CreatePaymentRequest;
use App\Services\DecidePaymentRequest;
use App\Services\ExchangeRate\ExchangeRateProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentRequestWebController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('PaymentRequests/Create');
    }

    /**
     * Current EUR -> user currency rate, used by the create form preview.
     */
    public function rate(Request $request, ExchangeRateProvider $exchangeRates): JsonResponse
    {
        $rate = $exchangeRates->getRate($request->user()->currency);

        return response()->json([
            'currency' => $rate->currency,
            'rate' => $rate->rate,
        ]);
    }

    public function store(StorePaymentRequestRequest $request, CreatePaymentRequest $action): RedirectResponse
    {
        $paymentRequest = $action->handle(
            user: $request->user(),
            description: $request->validated('description'),
            amountLocal: (float) $request->validated('amount_local'),
        );

        return redirect()
            ->route('payment-requests.show', $paymentRequest)
            ->with('success', 'Payment request submitted.');
    }

    public function show(PaymentRequest $paymentRequest): Response
    {
        $this->authorize('view', $paymentRequest);

        return Inertia::render('PaymentRequests/Show', [
            'paymentRequest' => PaymentRequestResource::make(
                $paymentRequest->load(['user', 'approver']),
            ),
        ]);
    }

    public function approve(PaymentRequest $paymentRequest, DecidePaymentRequest $action): RedirectResponse
    {
        $this->authorize('decide', $paymentRequest);

        $action->handle($paymentRequest, request()->user(), PaymentRequestStatus::Approved);

        return back()->with('success', 'Payment request approved.');
    }

    public function reject(PaymentRequest $paymentRequest, DecidePaymentRequest $action): RedirectResponse
    {
        $this->authorize('decide', $paymentRequest);

        $action->handle($paymentRequest, request()->user(), PaymentRequestStatus::Rejected);

        return back()->with('success', 'Payment request rejected.');
    }
}

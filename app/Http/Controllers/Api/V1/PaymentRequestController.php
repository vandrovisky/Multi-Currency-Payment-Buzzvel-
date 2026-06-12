<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PaymentRequestStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\IndexPaymentRequestsRequest;
use App\Http\Requests\Api\StorePaymentRequestRequest;
use App\Http\Resources\PaymentRequestResource;
use App\Models\PaymentRequest;
use App\Services\CreatePaymentRequest;
use App\Services\DecidePaymentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentRequestController extends Controller
{
    /**
     * List payment requests.
     *
     * Employees see only their own requests; finance users see all.
     * Optionally filter by status and paginate with per_page.
     */
    public function index(IndexPaymentRequestsRequest $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $requests = PaymentRequest::query()
            ->with(['user', 'approver'])
            ->unless($user->isFinance(), fn ($query) => $query->where('user_id', $user->id))
            ->when($request->validated('status'), fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate($request->validated('per_page', 15));

        return PaymentRequestResource::collection($requests);
    }

    /**
     * Show a payment request.
     */
    public function show(PaymentRequest $paymentRequest): PaymentRequestResource
    {
        $this->authorize('view', $paymentRequest);

        return PaymentRequestResource::make($paymentRequest->load(['user', 'approver']));
    }

    /**
     * Approve a pending payment request (finance only).
     */
    public function approve(PaymentRequest $paymentRequest, DecidePaymentRequest $action): PaymentRequestResource
    {
        $this->authorize('decide', $paymentRequest);

        return PaymentRequestResource::make(
            $action->handle($paymentRequest, request()->user(), PaymentRequestStatus::Approved)->load(['user', 'approver']),
        );
    }

    /**
     * Reject a pending payment request (finance only).
     */
    public function reject(PaymentRequest $paymentRequest, DecidePaymentRequest $action): PaymentRequestResource
    {
        $this->authorize('decide', $paymentRequest);

        return PaymentRequestResource::make(
            $action->handle($paymentRequest, request()->user(), PaymentRequestStatus::Rejected)->load(['user', 'approver']),
        );
    }
    /**
     * Create a payment request.
     *
     * The request is created in the authenticated user's local currency;
     * the EUR exchange rate is fetched and stored at creation time.
     */
    public function store(StorePaymentRequestRequest $request, CreatePaymentRequest $action): JsonResponse
    {
        $paymentRequest = $action->handle(
            user: $request->user(),
            description: $request->validated('description'),
            amountLocal: (float) $request->validated('amount_local'),
        );

        return PaymentRequestResource::make($paymentRequest)
            ->response()
            ->setStatusCode(201);
    }
}

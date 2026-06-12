<?php

namespace App\Http\Controllers;

use App\Enums\PaymentRequestStatus;
use App\Http\Resources\PaymentRequestResource;
use App\Models\PaymentRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'nullable', Rule::enum(PaymentRequestStatus::class)],
        ]);

        $user = $request->user();
        $status = $validated['status'] ?? null;

        $paymentRequests = PaymentRequest::query()
            ->with(['user', 'approver'])
            ->unless($user->isFinance(), fn ($query) => $query->where('user_id', $user->id))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Dashboard', [
            'paymentRequests' => PaymentRequestResource::collection($paymentRequests),
            'filters' => ['status' => $status],
        ]);
    }
}

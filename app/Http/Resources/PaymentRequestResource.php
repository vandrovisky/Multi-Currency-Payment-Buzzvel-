<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\PaymentRequest
 */
class PaymentRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'amount_local' => $this->amount_local,
            'currency' => $this->currency,
            'exchange_rate' => $this->exchange_rate,
            'amount_eur' => $this->amount_eur,
            'rate_source' => $this->rate_source,
            'rate_fetched_at' => $this->rate_fetched_at,
            'status' => $this->status,
            'user' => UserResource::make($this->whenLoaded('user')),
            'approved_by' => UserResource::make($this->whenLoaded('approver')),
            'approved_at' => $this->approved_at,
            'created_at' => $this->created_at,
        ];
    }
}

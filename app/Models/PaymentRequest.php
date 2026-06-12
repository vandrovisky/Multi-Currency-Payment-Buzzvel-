<?php

namespace App\Models;

use App\Enums\PaymentRequestStatus;
use Database\Factories\PaymentRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentRequest extends Model
{
    /** @use HasFactory<PaymentRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'amount_local',
        'currency',
        'exchange_rate',
        'amount_eur',
        'rate_source',
        'rate_fetched_at',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'amount_local' => 'decimal:2',
            'exchange_rate' => 'decimal:8',
            'amount_eur' => 'decimal:2',
            'rate_fetched_at' => 'datetime',
            'approved_at' => 'datetime',
            'status' => PaymentRequestStatus::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isPending(): bool
    {
        return $this->status === PaymentRequestStatus::Pending;
    }
}

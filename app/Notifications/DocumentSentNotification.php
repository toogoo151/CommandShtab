<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DocumentSentNotification extends Notification
{
    protected $document;

    public function __construct($document)
    {
        $this->document = $document;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'document_id' => $this->document->id,
            'sender_id' => $this->document->userID ?? null,
            'hariutaiEseh' => $this->document->hariutaiEseh ?? null,
            'aguulga' => $this->document->aguulga ?? null,
        ];
    }
}

import { Component, inject, Input } from '@angular/core';
import { Message } from '../../../models/messages.interface';
import { CommonModule } from '@angular/common';
import { SignalRService } from '../../../services/signalr.service';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-message',
  standalone: true,
  templateUrl: './message.component.html',
  imports: [CommonModule],
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent {
  private _message!: Message;
  displayName!: string;
  clientId!: string;
  isSelf = false;

  signalRService = inject(SignalRService);

  @Input()
  set message(value: Message) {
    this._message = value;
    [this.displayName, this.clientId] = value.user?.split(';') || [];
    this.isSelf = this.clientId === this.signalRService.getConnectionId();
  }

  get message(): Message {
    return this._message;
  }
}

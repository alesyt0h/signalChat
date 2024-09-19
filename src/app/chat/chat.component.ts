import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChatStore } from './store/chat.store';
import { MessageComponent } from './components/message/message.component';
import { SignalRService } from '../services/signalr.service';
import { Message } from '../models/messages.interface';
import { filter, map, Observable } from 'rxjs';
import { HubConnectionState } from '@microsoft/signalr';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { noWhitespaceAsyncValidator } from '../shared/utils/validators';
import { Notification } from '../models/notifications.interface';
import { NotificationStore } from './store/notification.store';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule, CardModule, InputTextModule, ButtonModule, MessageComponent, DialogModule, InputTextModule, ToastModule ],
  providers: [ChatStore, NotificationStore, SignalRService, MessageService],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  chatForm: FormGroup;
  notificationForm: FormGroup;
  showNotificacionDialog = false;
  messages$: Observable<Message[]>;
  connectionState$: Observable<HubConnectionState>;
  lastNotification$: Observable<Notification>;

  constructor(
    private signalRService: SignalRService,
    private chatStore: ChatStore,
    private notificationStore: NotificationStore,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.messages$ = this.chatStore.messages$;
    this.connectionState$ = this.signalRService.connectionState$;
    this.lastNotification$ = this.notificationStore.notifications$.pipe(
      filter(notifications => !!notifications && notifications.length > 0),
      map(notifications => notifications[notifications.length - 1])
    );

    this.chatForm = this.formBuilder.group({
      user: [''],
      message: ['', Validators.required, noWhitespaceAsyncValidator()],
    });
    this.notificationForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required, noWhitespaceAsyncValidator()],
    });
  }

  ngOnInit(): void {
    this.lastNotification$.subscribe(notificationData => {
        this.messageService.add({ severity: 'info', summary: notificationData.title, detail: notificationData.content });
    });
  }

  sendMessage(): void {
    if (this.chatForm.invalid) {
      this.chatForm.controls['message'].markAsDirty();
      return this.messageService.add({ severity: 'error', detail: 'El mensaje no puede estar vacío' });
    }

    const {user, message} = this.chatForm.getRawValue();
    const userString = (user.trim() ?? 'Anonymous') + ';' + this.signalRService.getConnectionId()

    this.signalRService.sendMessage(userString, message)
      .then(() => {
        this.chatForm.controls['message'].reset();
        if(user.trim() === '') this.chatForm.controls['user'].reset();
      })
      .catch((err) => console.error('Error al enviar mensaje:', err));
  }

  sendNotification(): void {
    if (this.notificationForm.invalid) {
      Object.keys(this.notificationForm.controls).forEach(key => this.notificationForm.controls[key].markAsDirty())
      return this.messageService.add({ severity: 'error', detail: 'Hay campos con errores' });
    }

    this.showNotificacionDialog = false;
    const {title, content} = this.notificationForm.getRawValue();

    this.signalRService.sendNotification(title, content)
    .then(() => (this.notificationForm.reset()))
    .catch((err) => console.error('Error al enviar mensaje:', err));
  }

  closeDialog(): void {
    this.showNotificacionDialog = false;
    this.notificationForm.reset();
  }
}

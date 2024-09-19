import { Injectable } from '@angular/core';
import { HubConnectionBuilder, HubConnection, HubConnectionState, } from '@microsoft/signalr';
import { environment } from '../../environments/environment.prod';
import { ChatStore } from '../chat/store/chat.store';
import { Message } from '../models/messages.interface';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../models/notifications.interface';
import { NotificationStore } from '../chat/store/notification.store';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  private connection: HubConnection;
  private connectionStateSubject = new BehaviorSubject<HubConnectionState>( HubConnectionState.Disconnected );
  connectionState$ = this.connectionStateSubject.asObservable();

  constructor(private chatStore: ChatStore, private notificationStore: NotificationStore) {
    this.connection = new HubConnectionBuilder()
      .withUrl(environment.hubUrl)
      .build();

    this.setupListeners();

    this.connection
      .start()
      .then(() => {
        console.log('SignalR - Conectado');
        this.connectionStateSubject.next(HubConnectionState.Connected);
      })
      .catch((err) => {
        console.error('SignalR - Error de conexión: ', err);
        this.connectionStateSubject.next(HubConnectionState.Disconnected);
      });
  }

  private setupListeners(): void {
    this.connection.on('ReceiveMessage', (messageData: Message) => {
      this.chatStore.addMessage(messageData);
    });

    this.connection.on('ReceiveNotification', (notificationData: Notification) => {
      this.notificationStore.addNotification(notificationData);
    });

    this.connection.onclose(() =>
      this.connectionStateSubject.next(HubConnectionState.Disconnected)
    );
    this.connection.onreconnecting(() =>
      this.connectionStateSubject.next(HubConnectionState.Reconnecting)
    );
    this.connection.onreconnected(() =>
      this.connectionStateSubject.next(HubConnectionState.Connected)
    );
  }

  public async sendMessage(user: string, message: string) {
    try {
      await this.connection.invoke('SendMessage', user, message);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  }

  public async sendNotification(title: string, content: string) {
    try {
      await this.connection.invoke('SendNotification', title, content);
    } catch (err) {
      console.error('Error al enviar la notificación:', err);
    }
  }

  getConnectionId(): string {
    return this.connection.connectionId || '';
  }

  get connectionState() {
    return this.connection.state;
  }
}

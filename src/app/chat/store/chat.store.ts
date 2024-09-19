import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Message } from '../../models/messages.interface';

interface ChatState {
  messages: Message[];
}

@Injectable()
export class ChatStore extends ComponentStore<ChatState> {
  constructor() {
    super({ messages: [] });
  }

  readonly messages$ = this.select((state) => state.messages);

  readonly addMessage = this.updater((state, newMessage: Message) => {
    return {
      ...state,
      messages: [...state.messages, newMessage],
    };
  });
}

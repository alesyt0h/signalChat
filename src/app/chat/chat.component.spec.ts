import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChatComponent } from './chat.component';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let messageServiceMock: any;

  beforeEach(async () => {
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, ReactiveFormsModule, FormsModule, CardModule, InputTextModule, ButtonModule, DialogModule, ToastModule, ChatComponent],
      providers: [ { provide: MessageService, useValue: messageServiceMock } ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize the chat form', () => {
    expect(component.chatForm).toBeTruthy();
    expect(component.chatForm.controls['message']).toBeTruthy();
  });

  it('should initialize the notification form', () => {
    expect(component.notificationForm).toBeTruthy();
    expect(component.notificationForm.controls['title']).toBeTruthy();
  });

  it('should call sendMessage when sendMessage', fakeAsync(() => {
    spyOn(component, 'sendMessage').and.callThrough();

    component.chatForm.get('user')?.setValue('usuario');
    component.chatForm.get('message')?.setValue('testt');

    component.sendMessage();
    expect(component.sendMessage).toHaveBeenCalledWith();
    expect(component.chatForm.valid).toBeTrue();
  }));

});

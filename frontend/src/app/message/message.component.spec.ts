import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageComponent } from './message.component';

describe('MessageComponent', () => {
  let component: MessageComponent;
  let fixture: ComponentFixture<MessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display an html element for each message', () => {
    expect(component.getMessageService().getMessages().size).toBe(0);
    component.getMessageService().add('test', 'WARNING', 2000);
    expect(component.getMessageService().getMessages().size).toBe(1);
    component.getMessageService().add('test2', 'ERROR', 2000);
    expect(component.getMessageService().getMessages().size).toBe(2);
    component.closeMessage(1);
    expect(component.getMessageService().getMessages().size).toBe(1);
  });
});

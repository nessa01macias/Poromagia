import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusComponent } from './status.component';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  function initializeComponent(): void {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusComponent ]
    })
    .compileComponents();

    initializeComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the card values from the local storage', () => {
    localStorage.setItem('CARD_STATUS', JSON.stringify({'takenImage': 'src123', 'recognizedImage': 'test123',
      'price': '1.34', 'stock': '12', 'wanted': 'false', 'box': 2}));
    initializeComponent();
    expect(component.takenImageSrc).toBe('src123');
    expect(component.recognizedImageLink).toBe('test123');
    expect(component.price).toBe('1.34');
    expect(component.stock).toBe('12');
    expect(component.wanted).toBe('false');
    expect(component.boxNumber).toBe(2);
  });

  it('should get the values of the recognized card and display them', () => {
    component.cardRecognizedListener(JSON.stringify({'imageLink': 'recImgLink',
      'price': '23.45', 'stock': '2', 'wanted': 'true', 'box': 3}));
    expect(component.recognizedImageLink).toBe('recImgLink');
    expect(component.price).toBe('23.45 €');
    expect(component.stock).toBe('2 pieces');
    expect(component.wanted).toBe('true ');
    expect(component.boxNumber).toBe(3);
    expect(component.waitingForResult).toBe(false);
  });

  it('should save the values of the recognized card in local storage', () => {
    localStorage.setItem('CARD_STATUS', JSON.stringify({'takenImage': 'takenImgTest'}));
    component.cardRecognizedListener(JSON.stringify({'imageLink': 'recImgLink',
      'price': '23.45', 'stock': '2', 'wanted': 'true', 'box': 3}));
    const localStorageValues = localStorage.getItem('CARD_STATUS');
    expect(localStorageValues).toBe(JSON.stringify({'takenImage': 'takenImgTest', 'recognizedImage': 'recImgLink',
      'price': '23.45 €', 'stock': '2 pieces', 'wanted': 'true ', 'box': 3}));
  });

  it('should display the taken image', () => {
    component.imageReceivedListener(JSON.stringify({'imgSrc': 'testImgSrc'}));
    expect(component.takenImageSrc).toBe('testImgSrc');
    expect(component.waitingForResult).toBe(true);
  });

  it('should save the taken image url in local storage', () => {
    localStorage.removeItem('CARD_STATUS');
    component.imageReceivedListener(JSON.stringify({'imgSrc': 'testImgSrc'}));
    const localStorageValues = localStorage.getItem('CARD_STATUS');
    expect(localStorageValues).toBe(JSON.stringify({'takenImage': 'testImgSrc'}));
  });
});

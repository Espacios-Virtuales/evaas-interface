import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalInteractionDirective } from './modal-interaction.directive';

@Component({
  standalone: true,
  imports: [ModalInteractionDirective],
  template: `<button id="trigger">Abrir</button><section tabindex="-1" evaasModalInteraction (modalEscape)="closed = true"><button data-modal-initial-focus>Cancelar</button><button>Confirmar</button></section>`,
})
class ModalHostComponent {
  closed = false;
}

describe('ModalInteractionDirective', () => {
  let fixture: ComponentFixture<ModalHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModalHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(ModalHostComponent);
    fixture.detectChanges();
  });

  it('traps Tab and emits close intent on Escape', () => {
    const modal = fixture.nativeElement.querySelector('section') as HTMLElement;
    const buttons = modal.querySelectorAll('button');
    (buttons[1] as HTMLButtonElement).focus();
    modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);

    modal.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(fixture.componentInstance.closed).toBeTrue();
  });

  it('locks background scroll while active and restores it when destroyed', () => {
    expect(document.body.style.overflow).toBe('hidden');
    fixture.destroy();
    expect(document.body.style.overflow).toBe('');
  });
});

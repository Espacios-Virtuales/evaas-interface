import { AfterViewInit, Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[evaasModalInteraction]',
})
export class ModalInteractionDirective implements AfterViewInit, OnDestroy {
  @Input() modalCloseDisabled = false;
  @Output() readonly modalEscape = new EventEmitter<void>();

  private previouslyFocused: HTMLElement | null = null;
  private static bodyLockCount = 0;
  private static previousBodyOverflow = '';

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    this.previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.lockBackgroundScroll();
    queueMicrotask(() => this.focusInitialElement());
  }

  ngOnDestroy(): void {
    this.unlockBackgroundScroll();
    this.previouslyFocused?.focus();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (!this.modalCloseDisabled) {
        event.preventDefault();
        this.modalEscape.emit();
      }
      return;
    }

    if (event.key !== 'Tab') return;

    const focusable = this.focusableElements();
    if (focusable.length === 0) {
      event.preventDefault();
      this.elementRef.nativeElement.focus();
      return;
    }

    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    const nextIndex = currentIndex === -1
      ? (event.shiftKey ? focusable.length - 1 : 0)
      : event.shiftKey
        ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
        : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1);

    if (currentIndex === -1 || nextIndex !== currentIndex + (event.shiftKey ? -1 : 1)) {
      event.preventDefault();
      focusable[nextIndex].focus();
    }
  }

  private focusInitialElement(): void {
    const initial = this.elementRef.nativeElement.querySelector<HTMLElement>('[data-modal-initial-focus]');
    (initial ?? this.focusableElements()[0] ?? this.elementRef.nativeElement).focus();
  }

  private focusableElements(): HTMLElement[] {
    return Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter(element => !element.hasAttribute('hidden'));
  }

  private lockBackgroundScroll(): void {
    if (ModalInteractionDirective.bodyLockCount === 0) {
      ModalInteractionDirective.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    ModalInteractionDirective.bodyLockCount += 1;
  }

  private unlockBackgroundScroll(): void {
    ModalInteractionDirective.bodyLockCount = Math.max(0, ModalInteractionDirective.bodyLockCount - 1);
    if (ModalInteractionDirective.bodyLockCount === 0) {
      document.body.style.overflow = ModalInteractionDirective.previousBodyOverflow;
    }
  }
}

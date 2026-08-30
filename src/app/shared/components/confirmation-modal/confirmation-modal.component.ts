import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalInteractionDirective } from '../../directives/modal-interaction.directive';

@Component({
  standalone: true,
  selector: 'evaas-confirmation-modal',
  imports: [CommonModule, ModalInteractionDirective],
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
})
export class ConfirmationModalComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) message = '';
  @Input({ required: true }) confirmLabel = '';
  @Input() contextLabel = '';
  @Input() contextValue = '';
  @Input() destructive = false;
  @Output() readonly confirmed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();
}

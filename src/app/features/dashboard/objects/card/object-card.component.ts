import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectCardItem } from '../../../../core/models/project.model';

@Component({
  standalone: true,
  selector: 'ev-object-card',
  imports: [CommonModule],
  templateUrl: './object-card.component.html',
  styleUrls: ['./object-card.component.scss']
})
export class ObjectCardComponent {
  @Input() item!: ProjectCardItem;

  // eventos hacia la grilla (la grilla abre diálogos y llama servicios)
  @Output() view = new EventEmitter<string>();
  @Output() remove = new EventEmitter<string>();
}

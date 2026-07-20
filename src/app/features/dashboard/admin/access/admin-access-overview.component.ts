import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'evaas-admin-access-overview',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-access-overview.component.html',
  styleUrls: ['./admin-access-overview.component.scss'],
})
export class AdminAccessOverviewComponent {}

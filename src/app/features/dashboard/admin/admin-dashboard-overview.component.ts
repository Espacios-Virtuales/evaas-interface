import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'evaas-admin-dashboard-overview',
  imports: [RouterLink],
  templateUrl: './admin-dashboard-overview.component.html',
  styleUrls: ['./admin-dashboard-overview.component.scss'],
})
export class AdminDashboardOverviewComponent {}

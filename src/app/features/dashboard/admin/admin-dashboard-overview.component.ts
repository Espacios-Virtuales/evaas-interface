import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccessProfileComponent } from '../../../shared/components/access-profile/access-profile.component';

@Component({
  standalone: true,
  selector: 'evaas-admin-dashboard-overview',
  imports: [RouterLink, AccessProfileComponent],
  templateUrl: './admin-dashboard-overview.component.html',
  styleUrls: ['./admin-dashboard-overview.component.scss'],
})
export class AdminDashboardOverviewComponent {}

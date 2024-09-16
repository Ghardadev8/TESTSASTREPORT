import { Routes } from '@angular/router';
import { RoleGuard } from '@app/core/guards/role.guard';

export const configurationRoutes: Routes = [{
  path: 'config-hierarchy',
  canActivate: [RoleGuard],
  data: { Code: 'ConfigHierarchy' },
  loadComponent: () => import('./config-hierarchy/config-hierarchy.component').then(c => c.ConfigHierarchyComponent)
},

{
  path: 'config-level/:level',
  canActivate: [RoleGuard],
  data: { Code: 'ConfigLevel' },
  loadComponent: () => import('./config-level/config-level.component').then(c => c.ConfigLevelComponent)
},
{
  path: 'common-configuration',
  data: { Code: 'CommonConfiguration' },
  canActivate: [RoleGuard],
  loadComponent: () => import('./common-configuration/common-configuration.component').then(c => c.CommonConfigurationComponent)
},
{
  path: 'app-configuration',
  data: { Code: 'ApplicationDefaultConfiguration' },
  canActivate: [RoleGuard],
  loadComponent: () => import('./application-configuration/application-configuration.component').then(c => c.ApplicationConfigurationComponent)
},
{
  path: 'application-configuration',
  data: { Code: 'ApplicationConfiguration' },
  canActivate: [RoleGuard],
  loadComponent: () => import('./application-default-configuration/application-default-configuration.component').then(c => c.ApplicationDefaultConfigurationComponent)
},
{
  path: 'email-matrix',
  data: { Code: 'EmailMatrix' },
  canActivate: [RoleGuard],
  loadComponent: () => import('./email-matrix/email-matrix.component').then(c => c.EmailMatrixComponent)
},
{
  path: 'organization-chart',
  data: { Code: 'OrganizationChart' },
  canActivate: [RoleGuard],
  loadComponent: () => import('./organization-chart/organization-chart.component').then(c => c.OrganizationChartComponent)
},
{
  path: 'page-access',
  data: { Code: 'PageAccess' },
  canActivate: [RoleGuard],
  loadComponent: () => import('./page-access/page-access.component').then(c => c.PageAccessComponent)
}
];

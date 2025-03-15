import { AppRoutes } from '@app/interfaces/app-route.interface';
import { ArrivalComponent } from './arrival.component';

const routes: AppRoutes = [
  {
    path: '',
    component: ArrivalComponent,
    data: {
      toolbarShadowEnabled: true
    },
    children: [
      {
        path: 'contact',
        loadComponent: () =>
          import('./contact/contact.component').then(
            (m) => m.ContactComponent
          )
      },
      {
        path: 'itinerary',
        loadComponent: () =>
          import('./itinerary/itinerary.component').then(
            (m) => m.ItineraryComponent
          )
      },
      {
        path: 'checkin',
        loadComponent: () =>
          import('./checkin/checkin.component').then(
            (m) => m.CheckinComponent
          )
      },
      {
        path: 'parking',
        loadComponent: () =>
          import('./parking/parking.component').then(
            (m) => m.ParkingComponent
          )
      },
      {
        path: 'rules',
        loadComponent: () =>
          import('./rules/rules.component').then(
            (m) => m.RulesComponent
          )
      }
    ]
  }
];

export default routes;

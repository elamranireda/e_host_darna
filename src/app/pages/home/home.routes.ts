import { HomeComponent } from './home.component';

const routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      toolbarShadowEnabled: true
    },
    children: [
      {
        path: 'arrival',
        loadChildren: () => import('./../arrival/arrival.routes')
      },
    ]
  }
];

export default routes;

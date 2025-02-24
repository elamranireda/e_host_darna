import { HomeComponent } from './home.component';

const routes = [
  {
    path: ':id',
    component: HomeComponent,
    data: {
      toolbarShadowEnabled: true
    },
    children: [
    ]
  }
];

export default routes;

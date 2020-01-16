import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { WriteDataComponent } from './write-data/write-data.component';
import { ReaddataComponent } from './readdata/readdata.component';

const routes: Routes = [
  { path: 'writeData', component: WriteDataComponent},
  { path: 'readData', component: ReaddataComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

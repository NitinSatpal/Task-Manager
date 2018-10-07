import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BoardComponent } from './board/board.component';
import { ListComponent } from './list/list.component';
import { TaskComponent } from './task/task.component';

import { BoardService } from './board/board.service';
import { TaskService } from './task/task.service';
import { ListService } from './list/list.service';
import { SocketService } from './socket.service';
import { HttpClient } from './httpclient';

import { OrderBy } from './pipes/orderby.pipe';
import { Where } from './pipes/where.pipe';


const appRoutes: Routes = [
	{ path: 'board/:id', component: BoardComponent },
  { path: '', component: HomeComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BoardComponent,
    ListComponent,
    TaskComponent,
    OrderBy,
    Where

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    BoardService,
    TaskService,
    ListService,
    SocketService,
    HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }

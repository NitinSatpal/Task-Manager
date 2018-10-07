import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import 'rxjs/add/observable/forkJoin';
import {HttpClient} from '../httpclient';
import {Board} from '../board/board';
import {List} from '../list/list';
import {Task} from '../task/task';

@Injectable()
export class BoardService {
  apiUrl = '/board';
  boardsCache: Board[] = [];

  constructor(private _http: HttpClient) {
  }

  getAll() {
    return this._http.get(this.apiUrl).pipe(map((res: Response) => <Board[]>res.json().data));
  }

  get(id: string) {
    return this._http.get(this.apiUrl + '/' + id)
      .pipe(map((res: Response) => <Board>res.json().data));
  }

  getBoardWithListsAndTasks(id: string){
    return Observable.forkJoin(this.get(id), this.getLists(id), this.getTasks(id));
  }

  getLists(id: string) {
    return this._http.get(this.apiUrl + '/' + id + '/lists')
      .pipe(map((res: Response) => <List[]>res.json().data));
  }

  getTasks(id: string) {
    return this._http.get(this.apiUrl + '/' + id + '/tasks')
      .pipe(map((res: Response) => <Task[]>res.json().data));
  }

  put(board: Board) {
    let body = JSON.stringify(board);
    return this._http.put(this.apiUrl + '/' + board._id, body)
      .pipe(map((res: Response) => <Board>res.json().data));
  }

  post(board: Board) {
    let body = JSON.stringify(board);
    return this._http.post(this.apiUrl, body)
      .pipe(map((res: Response) => <Board>res.json().data));
  }

  delete(board: Board) {
    return this._http.delete(this.apiUrl + '/' + board._id)
      .pipe(map((res: Response) => <Board>res.json().data));
  }
}

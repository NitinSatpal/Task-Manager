import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptionsArgs} from '@angular/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {HttpClient} from '../httpclient'
import {List} from '../list/list';
import {Task} from '../task/task';


@Injectable()
export class ListService {
  apiUrl = '/list';

  constructor(private _http: HttpClient) {
  }

  getAll() {
    return this._http.get(this.apiUrl)
      .pipe(map(res => <List[]>res.json().data));
  }

  get(id: string) {
    return this._http.get(this.apiUrl + '/' + id)
      .pipe(map(res => <List>res.json().data));
  }

  getTasks(id: string) {
    return this._http.get(this.apiUrl + '/' + id + '/tasks')
      .pipe(map(res => <Task[]>res.json().data));
  }

  put(list: List) {
    return this._http
      .put(this.apiUrl + '/' + list._id, JSON.stringify(list))
      .toPromise();
  }

  post(list: List) {;
    return this._http.post(this.apiUrl, JSON.stringify(list))
      .pipe(map(res => <List>res.json().data));
  }

  delete(list: List) {
    return this._http.delete(this.apiUrl + '/' + list._id)
      .toPromise();

  }

}

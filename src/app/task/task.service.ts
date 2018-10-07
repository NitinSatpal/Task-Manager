import {Injectable} from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {Http} from '@angular/http';
import {HttpClient} from '../httpclient';
import {Task} from '../task/task';

@Injectable()
export class TaskService {
  apiUrl = '/task';

  constructor(private _http: HttpClient) {
  }

  getAll() {
    return this._http.get(this.apiUrl)
      .pipe(map(res => res.json()));
  }

  get(id: string) {
    return this._http.get(this.apiUrl + '/' + id)
      .pipe(map(res => res.json()));
  }

  put(task: Task) {
    return this._http.put(this.apiUrl + '/' + task._id, JSON.stringify(task))
      .toPromise();
  }

  post(task: Task) {
    return this._http.post(this.apiUrl, JSON.stringify(task))
      .pipe(map(res => <Task>res.json().data));
  }

  delete(task: Task) {
    return this._http.delete(this.apiUrl + '/' + task._id)
      .toPromise();
  }

}

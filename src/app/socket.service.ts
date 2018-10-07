import {Injectable, EventEmitter} from '@angular/core';
import {Board} from './board/board';
import {List} from './list/list';
import {Task} from './task/task';
import { ROOT_URL } from './constants'

declare var io;

@Injectable()
export class SocketService {
  socket: any;
  public onListAdd: EventEmitter<List>;
  public onTaskAdd: EventEmitter<Task>;
  public onListUpdate: EventEmitter<List>;
  public onTaskUpdate: EventEmitter<Task>;

  constructor() {
    this.onListAdd = new EventEmitter();
    this.onTaskAdd = new EventEmitter();
    this.onListUpdate = new EventEmitter();
    this.onTaskUpdate = new EventEmitter();
  }

  connect(){
    this.socket = io(ROOT_URL);

    this.socket.on('addList', data => {
      this.onListAdd.emit(<List>data.list);
    });
    this.socket.on('addCard', data => {
      this.onTaskAdd.emit(<Task>data.task);
    });
    this.socket.on('updateList', data => {
      this.onListUpdate.emit(<List>data.list);
    });
    this.socket.on('updateTask', data => {
      this.onTaskUpdate.emit(<Task>data.task);
    });
  }

  join(boardId: string) {
    this.socket.emit('joinBoard', boardId);
  }

  leave(boardId: string) {
    this.socket.emit('leaveBoard', boardId);
  }

  addList(boardId:string, list: List){
    this.socket.emit('addList', { boardId: boardId, list: list });
  }

  addTask(boardId: string, task: Task) {
    this.socket.emit('addTask', { boardId: boardId, task: task });
  }

  updateList(boardId: string, list: List) {
    this.socket.emit('updateList', { boardId: boardId, list: list });
  }

  updateTask(boardId: string, task: Task) {
    this.socket.emit('updateTask', { boardId: boardId, task: task });
  }
}
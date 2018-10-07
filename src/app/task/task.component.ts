import {Component, OnInit, Input, Output, EventEmitter, ElementRef, ChangeDetectorRef, NgZone} from '@angular/core';
import {Task} from './task';
import {List} from '../list/list';
import {TaskService} from './task.service';
import {SocketService} from '../socket.service';

@Component({
  selector: 'auzmor-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent implements OnInit {
  @Input()
  task: Task;
  @Output() taskUpdate: EventEmitter<Task>;
  editingTask = false;
  currentTitle: string;
  zone: NgZone;
  constructor(private el: ElementRef,
    private _ref: ChangeDetectorRef,
    private _socketService: SocketService,
    private _taskService: TaskService) {
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.taskUpdate = new EventEmitter();
  }

  ngOnInit() {
    this._socketService.onTaskUpdate.subscribe((task: Task) => {
      if (this.task._id === task._id) {
        this.task.title = task.title;
        this.task.order = task.order;
        this.task.listId = task.listId;
      }
    });
  }

  blurOnEnter(event) {
    if (event.keyCode === 13) {
      event.target.blur();
    } else if (event.keyCode === 27) {
      this.task.title = this.currentTitle;
      this.editingTask = false;
    }
  }

  editTask() {
    this.editingTask = true;
    this.currentTitle = this.task.title;

    let textArea = this.el.nativeElement.getElementsByTagName('textarea')[0];

    setTimeout(function() {
      textArea.focus();
    }, 0);
  }

  updateTask() {
    if (!this.task.title || this.task.title.trim() === '') {
      this.task.title = this.currentTitle;
    }

    this._taskService.put(this.task).then(res => {
      this._socketService.updateTask(this.task.boardId, this.task);
    });
    this.editingTask = false;
  }
}
import {Component, Input, Output, OnInit, AfterViewInit, EventEmitter, ElementRef} from '@angular/core';
import {List} from './list';
import {Task} from '../task/task';
import {TaskComponent} from '../task/task.component'
import {ListService} from './list.service';
import {SocketService} from '../socket.service';
import {TaskService} from '../task/task.service';
import {OrderBy} from '../pipes/orderby.pipe';
import {Where} from '../pipes/where.pipe';

declare var jQuery: any;

@Component({
  selector: 'auzmor-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {
  @Input()
  list: List;
  @Input()
  tasks: Task[];
  @Output()
  public onAddTask: EventEmitter<Task>;
  @Output() taskUpdate: EventEmitter<Task>;

  editingList = false;
  addingTask = false;
  addTaskText: string;
  currentTitle: string;

  constructor(private el: ElementRef,
    private _socketService: SocketService,
    private _listService: ListService,
    private _taskService: TaskService) {
    this.onAddTask = new EventEmitter();
    this.taskUpdate = new EventEmitter();
  }

  ngOnInit() {
    this.setupView();
    this._socketService.onListUpdate.subscribe((list: List) => {
      if (this.list._id === list._id) {
        this.list.title = list.title;
        this.list.order = list.order;
      }
    });
  }

  setupView() {
    let component = this;
    var startList;
    jQuery('.task-list').sortable({
      connectWith: ".task-list",
      placeholder: "task-placeholder",
      dropOnEmpty: true,
      tolerance: 'pointer',
      start: function(event, ui) {
        ui.placeholder.height(ui.item.outerHeight());
        startList = ui.item.parent();
      },
      stop: function(event, ui) {
        var senderListId = startList.attr('list-id');
        var targetListId = ui.item.closest('.task-list').attr('list-id');
        var taskId = ui.item.find('.task').attr('task-id');

        component.updateTasksOrder({
          listId: targetListId || senderListId,
          taskId: taskId
        });
      }
    });
    jQuery('.task-list').disableSelection();
  }

  updateTasksOrder(event) {
    let taskArr = jQuery('[task-id=' + event.taskId + '] .task'),
      i: number = 0,
      elBefore: number = -1,
      elAfter: number = -1,
      newOrder: number = 0;

    for (i = 0; i < taskArr.length - 1; i++) {
      if (taskArr[i].getAttribute('task-id') == event.taskId) {
        break;
      }
    }

    if (taskArr.length > 1) {
      if (i > 0 && i < taskArr.length - 1) {
        elBefore = +taskArr[i - 1].getAttribute('task-order');
        elAfter = +taskArr[i + 1].getAttribute('task-order');

        newOrder = elBefore + ((elAfter - elBefore) / 2);
      }
      else if (i == taskArr.length - 1) {
        elBefore = +taskArr[i - 1].getAttribute('task-order');
        newOrder = elBefore + 1000;
      } else if (i == 0) {
        elAfter = +taskArr[i + 1].getAttribute('task-order');

        newOrder = elAfter / 2;
      }
    } else {
      newOrder = 1000;
    }


    let task = this.tasks.filter(x => x._id === event.taskId)[0];
    let oldListId = task.listId;
    task.order = newOrder;
    task.listId = event.listId;
    this._taskService.put(task).then(res => {
      this._socketService.updateTask(this.list.boardId, task);
    });
  }

  blurOnEnter(event) {
    if (event.keyCode === 13) {
      event.target.blur();
    }
  }

  addListOnEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.updateList();
    } else if (event.keyCode === 27) {
      this.clearAddList();
    }
  }

  addTask() {
    this.tasks = this.tasks || [];
    let newTask = <Task>{
      title: this.addTaskText,
      order: (this.tasks.length + 1) * 1000,
      listId: this.list._id,
      boardId: this.list.boardId
    };
    this._taskService.post(newTask)
      .subscribe(task => {
        this.onAddTask.emit(task);
        this._socketService.addTask(task.boardId, task);
      });
  }

  addTaskOnEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      if (this.addTaskText && this.addTaskText.trim() !== '') {
        this.addTask();
        this.addTaskText = '';
      } else {
        this.clearAddTask();
      }
    } else if (event.keyCode === 27) {
      this.clearAddTask();
    }
  }

  updateList() {
    if (this.list.title && this.list.title.trim() !== '') {
      this._listService.put(this.list).then(res => {
        this._socketService.updateList(this.list.boardId, this.list);
      });
      this.editingList = false;
    } else {
      this.clearAddList();
    }
  }

  clearAddList() {
    this.list.title = this.currentTitle;
    this.editingList = false;
  }

  editList() {
    this.currentTitle = this.list.title;
    this.editingList = true;
    let input = this.el.nativeElement
      .getElementsByClassName('list-header')[0]
      .getElementsByTagName('input')[0];

    setTimeout(function() { input.focus(); }, 0);
  }

  enableAddTask() {
    this.addingTask = true;
    let input = this.el.nativeElement
      .getElementsByClassName('add-task')[0]
      .getElementsByTagName('input')[0];

    setTimeout(function() { input.focus(); }, 0);
  }


  updateListOnBlur() {
    if (this.editingList) {
      this.updateList();
      this.clearAddTask();
    }
  }


  addTaskOnBlur() {
    if (this.addingTask) {
      if (this.addTaskText && this.addTaskText.trim() !== '') {
        this.addTask();
      }
    }
    this.clearAddTask();
  }

  clearAddTask() {
    this.addingTask = false;
    this.addTaskText = '';
  }

  onTaskUpdate(task: Task){
    this.taskUpdate.emit(task);
  }
}
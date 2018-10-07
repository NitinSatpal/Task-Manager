import { Component, Input, OnInit, OnDestroy, AfterViewInit, ElementRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Board } from '../board/board';
import { List } from '../list/list';
import { Task } from '../task/task';
import { BoardService } from './board.service';
import { ListService } from '../list/list.service';
import { SocketService } from '../socket.service';
import { ListComponent } from '../list/list.component';
import { OrderBy } from '../pipes/orderby.pipe';
import { Where } from '../pipes/where.pipe';
import { Router, Params, ActivatedRoute } from '@angular/router';

declare var jQuery: any;
var curYPos = 0,
  curXPos = 0,
  curDown = false;

@Component({
  selector: 'auzmor-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy {
  board: Board;
  addingList = false;
  addListText: string;
  editingTilte = false;
  currentTitle: string;
  boardWidth: number;
  listsAdded: number = 0;

  constructor(public el: ElementRef,
    private _socketService: SocketService,
    private _boardService: BoardService,
    private _listService: ListService,
    private _router: Router,
    private _route: ActivatedRoute) {
  }

  ngOnInit() {
    this._socketService.connect();
    this._socketService.onListAdd.subscribe(list => {
      this.board.lists.push(list);
      this.updateBoardWidth();
    });

    this._socketService.onTaskAdd.subscribe(task => {
      this.board.tasks.push(task);
    });

    let boardId = this._route.snapshot.params['id'];

    this._boardService.getBoardWithListsAndTasks(boardId)
      .subscribe(data => {
        this._socketService.join(boardId);
    
        this.board = data[0];
        this.board.lists = data[1];
        this.board.tasks = data[2];
        document.title = this.board.title + " | Auzmor Task Manager";
        this.setupView();        
      });
  }

  ngOnDestroy(){
    this._socketService.leave(this.board._id);
  }

  setupView() {
    let component = this;
    setTimeout(function () {
      var startList;
      jQuery('#main').sortable({
        items: '.sortable-list',
        handler: '.header',
        connectWith: "#main",
        placeholder: "list-placeholder",
        dropOnEmpty: true,
        tolerance: 'pointer',
        start: function (event, ui) {
          ui.placeholder.height(ui.item.find('.list').outerHeight());
          startList = ui.item.parent();
        },
        stop: function (event, ui) {
          var listId = ui.item.find('.list').attr('list-id');

          component.updateListOrder({
            listId: listId
          });
        }
      }).disableSelection();

      //component.bindPane();;

      window.addEventListener('resize', function (e) {
        component.updateBoardWidth();
      });
      component.updateBoardWidth();
      document.getElementById('content-wrapper').style.backgroundColor = '';
    }, 100);
  }

  bindPane() {
    let el = document.getElementById('content-wrapper');
    el.addEventListener('mousemove', function (e) {
      e.preventDefault();
      if (curDown === true) {
        el.scrollLeft += (curXPos - e.pageX) * .25;// x > 0 ? x : 0;
        el.scrollTop += (curYPos - e.pageY) * .25;// y > 0 ? y : 0;
      }
    });

    el.addEventListener('mousedown', function (e) {
      if (e.srcElement.id === 'main' || e.srcElement.id === 'content-wrapper') {
        curDown = true;
      }
      curYPos = e.pageY; curXPos = e.pageX;
    });
    el.addEventListener('mouseup', function (e) {
      curDown = false;
    });
  }

  updateBoardWidth() {
    if (this.listsAdded > 0) {
      let wrapper = document.getElementById('content-wrapper');
      wrapper.scrollLeft = wrapper.scrollWidth;
    }

    this.listsAdded++;
  }

  updateBoard() {
    if (this.board.title && this.board.title.trim() !== '') {
      this._boardService.put(this.board).subscribe(board => {
        if(board && board.title) {
          this.board.title = board.title;
          this.currentTitle = board.title;
        } else {
          this.board.title = this.currentTitle;
        }
      });
    } else {
      this.board.title = this.currentTitle;
    }
    this.editingTilte = false;
    //document.title = this.board.title + " | Auzmor Task Manager";
  }

  editTitle() {
    this.editingTilte = true;
    this.currentTitle = this.board.title;
    console.log(this.currentTitle);
    let input = this.el.nativeElement
      .getElementsByClassName('board-title')[0]
      .getElementsByTagName('input')[0];

    setTimeout(function () { input.focus(); }, 0);
  }

  deleteBoard() {
    if(confirm("Are you sure to delete Board " + this.board.title)) {
      this._boardService.delete(this.board).subscribe(board => {
        if(board) {
          alert('Board delete successfully');
          this._router.navigateByUrl('/');
        } else {
          alert('Board could not be deleted');
        }
      });
    }
  }

  updateListElements(list: List) {
    let listArr = jQuery('#main .list');
    let listEl = jQuery('#main .list[listid=' + list._id + ']');
    let i = 0;
    for (; i < listArr.length - 1; i++) {
      list.order < +listArr[i].getAttibute('list-order');
      break;
    }

    listEl.remove().insertBefore(listArr[i]);
  }

  updateListOrder(event) {
    let i: number = 0,
      elBefore: number = -1,
      elAfter: number = -1,
      newOrder: number = 0,
      listEl = jQuery('#main'),
      listArr = listEl.find('.list');

    for (i = 0; i < listArr.length - 1; i++) {
      if (listEl.find('.list')[i].getAttribute('list-id') == event.listId) {
        break;
      }
    }

    if (i > 0 && i < listArr.length - 1) {
      elBefore = +listArr[i - 1].getAttribute('list-order');
      elAfter = +listArr[i + 1].getAttribute('list-order');

      newOrder = elBefore + ((elAfter - elBefore) / 2);
    }
    else if (i == listArr.length - 1) {
      elBefore = +listArr[i - 1].getAttribute('list-order');
      newOrder = elBefore + 1000;
    } else if (i == 0) {
      elAfter = +listArr[i + 1].getAttribute('list-order');

      newOrder = elAfter / 2;
    }

    let list = this.board.lists.filter(x => x._id === event.listId)[0];
    list.order = newOrder;
    this._listService.put(list).then(res => {
      this._socketService.updateList(this.board._id, list);
    });
  }


  blurOnEnter(event) {
    if (event.keyCode === 13) {
      event.target.blur();
    }
  }

  enableAddList() {
    this.addingList = true;
    let input = jQuery('.add-list')[0]
      .getElementsByTagName('input')[0];

    setTimeout(function () { input.focus(); }, 0);
  }

  addList() {
    let newList = <List>{
      title: this.addListText,
      order: (this.board.lists.length + 1) * 1000,
      boardId: this.board._id
    };
    this._listService.post(newList)
      .subscribe(list => {
        this.board.lists.push(list);
        this.updateBoardWidth();
        this.addListText = '';
        this._socketService.addList(this.board._id, list);
      });
  }

  addListOnEnter(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      if (this.addListText && this.addListText.trim() !== '') {
        this.addList();
      } else {
        this.clearAddList();
      }
    }
    else if (event.keyCode === 27) {
      this.clearAddList();
    }
  }

  addListOnBlur() {
    if (this.addListText && this.addListText.trim() !== '') {
      this.addList();
    }
    this.clearAddList();
  }

  clearAddList() {
    this.addingList = false;
    this.addListText = '';
  }


  addTask(task: Task) {
    this.board.tasks.push(task);
  }

  forceUpdateTasks() {
    var tasks = JSON.stringify(this.board.tasks);
    this.board.tasks = JSON.parse(tasks);
  }


  onTaskUpdate(task: Task) {
    this.forceUpdateTasks();
  }
}
import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BoardService} from '../board/board.service';
import {Board} from '../board/board'

@Component({
  selector: 'auzmor-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  boards: Board[];
  boardTitle: string = '';

  constructor(private _boardservice: BoardService, private _router: Router,  ) { }

  ngOnInit() {
    this.boards = [];
    this._boardservice.getAll().subscribe((boards:Board[]) => {
      this.boards = boards;
    });
    
  }

  public addBoard(){
    if(this.boardTitle == '') {
      alert('Please enter the title!');
      return;
    }

    this._boardservice.post(<Board>{ title: this.boardTitle })
      .subscribe((board: Board) => {
        this._router.navigate(['/board', board._id]);
    });
  }

}
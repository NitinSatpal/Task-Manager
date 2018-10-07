import {List} from '../list/list';
import {Task} from '../task/task';

export class Board {
	_id: string;
	title: string;
	lists: List[];
  	tasks: Task[];
}
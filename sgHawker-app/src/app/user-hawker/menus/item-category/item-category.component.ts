import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'item-category',
  templateUrl: './item-category.component.html',
  styleUrls: ['./item-category.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ItemCategoryComponent implements OnInit {
  @Input() itemCategories: string[];
  @Input() showAddTag = true;
  @Input() selectedItem: string;
  @Output() selectedItemChange = new EventEmitter<string>();
  @Input() editCallback: (oldItem: string) => void = null;

  constructor() { }

  ngOnInit() {
  }

  addTagFn = (name) => {
    this.clickSelectItem(name);
    return name;
  };

  clickSelectItem = (item) => {
    this.selectedItemChange.emit(item);
  };
}

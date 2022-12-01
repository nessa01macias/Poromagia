import {Component, Input} from '@angular/core';


/**
 * component to display the navigation menu (hamburger menu)
 */
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {

  @Input() activeIndex: number = 0;

  constructor() { }

}

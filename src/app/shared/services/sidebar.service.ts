import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { ISectionSidebar } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isExpandedSubject = new BehaviorSubject<boolean>(true);
  private isMobileOpenSubject = new BehaviorSubject<boolean>(false);
  private isActivedSubject = new BehaviorSubject<boolean>(false);

  public sections = signal(new Map<number, ISectionSidebar[]>());

  isExpanded$ = this.isExpandedSubject.asObservable();
  isMobileOpen$ = this.isMobileOpenSubject.asObservable();
  isActived$ = this.isActivedSubject.asObservable();

  setExpanded(val: boolean) {
    this.isExpandedSubject.next(val);
  }

  toggleExpanded() {
    this.isExpandedSubject.next(!this.isExpandedSubject.value);
  }

  setMobileOpen(val: boolean) {
    this.isMobileOpenSubject.next(val);
  }

  toggleMobileOpen() {
    this.isMobileOpenSubject.next(!this.isMobileOpenSubject.value);
  }

  setSections(id: number, sections: ISectionSidebar[]) {
    this.sections.update(
      map => {
        map.set(id, sections);
        return new Map(map);
      }
    )
  }

  setActivedItem(id: number, idSection: number, idItem: number) {
    this.sections.update(map => {
      const sections = map.get(id);
      if (!sections) {
        return map;
      }
  
      const updateSections = sections.map(
        section =>
          idSection === section.id
            ? {
              ...section,
              items: section.items.map(
                item => ({
                  ...item,
                  actived: item.id === idItem
                })
              )
            }
            : section
      );
      const clone = new Map(map);

      clone.set(id, updateSections);
      return clone;
    })
  }
}

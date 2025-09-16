import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Loading Global
  private loadingGSub = new BehaviorSubject<boolean>(false);
  
  loadingG$ = this.loadingGSub.asObservable();

  // Loading section
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  loading$ = this.loadingSubject.asObservable();

  on() {
    this.loadingGSub.next(true);
  }

  off() {
    this.loadingGSub.next(false);
  }

  loadingOn() {
    this.loadingSubject.next(true);
  }

  loadingOff() {
    this.loadingSubject.next(false);
  }

  getLoadingStates(actionId: string) {
    if (!this.loadingStates.has(actionId)) {
      this.loadingStates.set(actionId, new BehaviorSubject<boolean>(false));
    }
    return this.loadingStates.get(actionId)!.asObservable();
  }

  setLoadingStates(actionId: string, isLoading: boolean) {
    if (!this.loadingStates.has(actionId)) {
      this.loadingStates.set(actionId, new BehaviorSubject<boolean>(false));
    }
    return this.loadingStates.get(actionId)!.next(isLoading);
  }

  get isLoadingG(): boolean {
    return this.loadingGSub.value;
  }

  isLoading(actionId: string): boolean {
    return this.loadingStates.get(actionId)?.value || false;
  }

  clearLoading(actionId: string) {
    if (this.loadingStates.has(actionId)) {
      this.loadingStates.get(actionId)!.next(false);
    }
  }

  clearAllLoading() {
    this.loadingStates.forEach(subject => subject.next(false));
  }
}

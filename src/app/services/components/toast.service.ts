import { Injectable } from '@angular/core';
import { Dismiss } from 'flowbite';
import type { DismissOptions, DismissInterface } from "flowbite";
import type { InstanceOptions } from 'flowbite';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(
  ) {}

  openToast(
    id: string,
    type: 'success' | 'danger' | 'warning',
    message: string
  ) {
    const toastContainer = document.createElement('div');
    toastContainer.id = id;
    toastContainer.className = '';
    document.body.appendChild(toastContainer);

    const toast = document.createElement('div');
    toast.className = this.getToastClass(type);
    toast.innerHTML = this.getToastContent(type, message);

    const closeButton = toast.querySelector('[data-dismiss-target]');
    closeButton?.addEventListener('click', () => {
      this.removeToast(id);
    });

    toastContainer.appendChild(toast);

    setTimeout(() => {
      this.removeToast(id);
    }, 5000);

  }

  private getToastClass(type: 'success' | 'danger' | 'warning'): string {
    return `fixed flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow right-5 bottom-5 dark:text-gray-400 dark:bg-gray-800 transition-opacity duration-300 ${
      type === 'success'
        ? 'border-green-500 dark:border-green-700'
        : type === 'danger'
        ? 'border-red-500 dark:border-red-700'
        : 'border-orange-500 dark:border-orange-700'
    }`;
  }

  private getToastContent(type: 'success' | 'danger' | 'warning', message: string): string {
    const icons = {
      success: `<svg class="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/></svg>`,
      danger: `<svg class="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/></svg>`,
      warning: `<svg class="w-5 h-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/></svg>`,
    };

    return `
      <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg dark:bg-gray-700">
        ${icons[type]}
      </div>
      <div class="ms-3 text-sm font-normal">${message}</div>
      <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg p-1.5 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target>
        <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    `;
  }

  private removeToast(id: string) {
    const toastOpened = document.getElementById(id);
    if ( !toastOpened ) return;
    toastOpened.classList.add('opacity-0');
    setTimeout(() => {
      toastOpened.remove();
    }, 300);
  }
  
}

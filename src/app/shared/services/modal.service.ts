import { Injectable } from '@angular/core';
import { Modal } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';
import type { InstanceOptions } from 'flowbite';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor() { }

  createModal(idModal: string) {
    const $modalElement: HTMLElement = document.querySelector(`#${idModal}`)!;

    const modalOptions: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
        closable: true,
        onHide: () => {},
        onShow: () => {},
        onToggle: () => {},
    };

    const instanceOptions: InstanceOptions = {
      id: 'modalEl',
      override: true
    };

    const modal: ModalInterface = new Modal($modalElement, modalOptions, instanceOptions);

    return modal;
  }

  openModal(modal: ModalInterface) {
    modal.show();
  }

  closeModal(modal: ModalInterface) {
    modal.hide();
  }
}

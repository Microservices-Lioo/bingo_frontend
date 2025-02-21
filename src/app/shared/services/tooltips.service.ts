import { Injectable } from '@angular/core';
import { Tooltip } from 'flowbite';
import type { TooltipOptions, TooltipInterface } from 'flowbite';
import type { InstanceOptions } from 'flowbite';

@Injectable({
  providedIn: 'root'
})
export class TooltipsService {

  constructor() { }

  createToolTip(btn: string, ctt: string) {
    const $targetEl = document.getElementById(ctt);

    const $triggerEl = document.getElementById(btn);

    if (!$targetEl && !$triggerEl ) return;

    const options: TooltipOptions = {
      placement: 'top',
      triggerType: 'hover',
      onHide: () => { },
      onShow: () => { },
      onToggle: () => { },
    };

    const instanceOptions: InstanceOptions = {
      id: 'tooltipContent',
      override: true
    };

    const tooltip: TooltipInterface = new Tooltip($targetEl, $triggerEl, options, instanceOptions);

    return tooltip;
  }

  // show the tooltip
  show(tool: TooltipInterface) {
    tool.show();
  }

  // hide the tooltip
  hide(tool: TooltipInterface) {
    tool.hide();
  }

  // toggle the tooltip
  toogle(tool: TooltipInterface) {
    tool.toggle();
  }

  // destroy tooltip object (removes event listeners and off-canvas Popper.js)
  destroy(tool: TooltipInterface) {
    tool.destroy();
  }

  // re-initialize tooltip object
  init(tool: TooltipInterface) {
    tool.init();
  }
}

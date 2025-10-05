import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EventServiceShared } from '../../shared/services';

export const eventGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const eventSharedServ = inject(EventServiceShared);

  try {
    const eventId = route.paramMap.get('id');
    const userId = route.paramMap.get('userId');
    
    if ( eventId === null || userId === null ) {
      return router.navigateByUrl('/').then(() => false);
    }

    eventSharedServ.getEventWithAwards(eventId).subscribe({
      next: (event) => {
        return true;
      },
      error: (error) => {
        return router.navigateByUrl('/').then(() => false);
      }
    });
    return true;
  } catch (error) {
    return router.navigateByUrl('/').then(() => false);
  }
};
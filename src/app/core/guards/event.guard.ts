import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EventServiceShared } from '../../shared/services';

export const eventGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const eventSharedServ = inject(EventServiceShared);

  try {
    const event = route.paramMap.get('id');
    const user = route.paramMap.get('userId');
    
    if ( event === null || user === null ) {
      return router.navigate(['/home']).then(() => false);
    }

    const eventId = parseInt(event, 10);
    const userId = parseInt(user, 10);

    if ( isNaN(eventId) || isNaN(userId)) {
      return router.navigate(['/home']).then(() => false);
    }

    eventSharedServ.getEventWithAwards(+eventId, +userId).subscribe({
      next: (event) => {
        return true;
      },
      error: (error) => {
        return router.navigate(['/home']).then(() => false);
      }
    });
    return true;
  } catch (error) {
    return router.navigate(['/home']).then(() => false);
  }
};
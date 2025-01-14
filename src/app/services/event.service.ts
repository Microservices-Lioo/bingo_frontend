import { Injectable, signal } from '@angular/core';
import { EventModel } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor() { }

  eventList = signal<EventModel[]>([
    {
      "id": 1,
      "name": "Conference",
      "description": "Annual tech conference",
      "user": {
        "id": 1,
        "name": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com",
        "password": "password123"
      },
      "status": "active",
      "start_time": new Date('2024-12-13T22:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 2,
      "name": "Workshop",
      "description": "Frontend development workshop",
      "user": {
        "id": 2,
        "name": "Jane",
        "lastname": "Smith",
        "email": "jane.smith@example.com",
        "password": "password456"
      },
      "status": "active",
      "start_time": new Date('2024-12-13T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 3,
      "name": "Webinar",
      "description": "Cloud computing webinar",
      "user": {
        "id": 3,
        "name": "Alice",
        "lastname": "Johnson",
        "email": "alice.johnson@example.com",
        "password": "password789"
      },
      "status": "scheduled",
      "start_time": new Date('2024-12-14T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 4,
      "name": "Team Meeting",
      "description": "Quarterly team sync-up",
      "user": {
        "id": 4,
        "name": "Bob",
        "lastname": "Brown",
        "email": "bob.brown@example.com",
        "password": "password321"
      },
      "status": "completed",
      "start_time": new Date('2024-12-12T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 5,
      "name": "Hackathon",
      "description": "Coding challenge event",
      "user": {
        "id": 5,
        "name": "Charlie",
        "lastname": "Williams",
        "email": "charlie.williams@example.com",
        "password": "password654"
      },
      "status": "completed",
      "start_time": new Date('2024-12-12T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 6,
      "name": "Networking Event",
      "description": "Business networking session",
      "user": {
        "id": 6,
        "name": "Diana",
        "lastname": "Taylor",
        "email": "diana.taylor@example.com",
        "password": "password987"
      },
      "status": "active",
      "start_time": new Date('2024-12-13T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 7,
      "name": "Product Launch",
      "description": "Launch of a new software product",
      "user": {
        "id": 7,
        "name": "Ethan",
        "lastname": "Davis",
        "email": "ethan.davis@example.com",
        "password": "passwordabc"
      },
      "status": "scheduled",
      "start_time": new Date('2024-12-14T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 8,
      "name": "Training Session",
      "description": "Backend development training",
      "user": {
        "id": 8,
        "name": "Fiona",
        "lastname": "Miller",
        "email": "fiona.miller@example.com",
        "password": "passworddef"
      },
      "status": "completed",
      "start_time": new Date('2024-12-12T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 9,
      "name": "Charity Event",
      "description": "Fundraiser for local charities",
      "user": {
        "id": 9,
        "name": "George",
        "lastname": "Wilson",
        "email": "george.wilson@example.com",
        "password": "passwordghi"
      },
      "status": "active",
      "start_time": new Date('2024-12-13T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 10,
      "name": "Sports Meetup",
      "description": "Community sports gathering",
      "user": {
        "id": 10,
        "name": "Hannah",
        "lastname": "Moore",
        "email": "hannah.moore@example.com",
        "password": "passwordjkl"
      },
      "status": "scheduled",
      "start_time": new Date('2024-12-14T16:00:00.000-05:00'),
      "val_cart": 100.0
    }
  ]);

  eventListActiveSchedule = signal<EventModel[]>([
    {
      "id": 1,
      "name": "Conference",
      "description": "Annual tech conference",
      "user": {
        "id": 1,
        "name": "John",
        "lastname": "Doe",
        "email": "john.doe@example.com",
        "password": "password123"
      },
      "status": "active",
      "start_time": new Date('2024-12-13T22:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 2,
      "name": "Workshop",
      "description": "Frontend development workshop",
      "user": {
        "id": 2,
        "name": "Jane",
        "lastname": "Smith",
        "email": "jane.smith@example.com",
        "password": "password456"
      },
      "status": "active",
      "start_time": new Date('2024-12-16T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 3,
      "name": "Webinar",
      "description": "Cloud computing webinar",
      "user": {
        "id": 3,
        "name": "Alice",
        "lastname": "Johnson",
        "email": "alice.johnson@example.com",
        "password": "password789"
      },
      "status": "scheduled",
      "start_time": new Date('2024-12-14T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 6,
      "name": "Networking Event",
      "description": "Business networking session",
      "user": {
        "id": 6,
        "name": "Diana",
        "lastname": "Taylor",
        "email": "diana.taylor@example.com",
        "password": "password987"
      },
      "status": "active",
      "start_time": new Date('2024-12-13T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 7,
      "name": "Product Launch",
      "description": "Launch of a new software product",
      "user": {
        "id": 7,
        "name": "Ethan",
        "lastname": "Davis",
        "email": "ethan.davis@example.com",
        "password": "passwordabc"
      },
      "status": "scheduled",
      "start_time": new Date('2024-12-14T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 9,
      "name": "Charity Event",
      "description": "Fundraiser for local charities",
      "user": {
        "id": 9,
        "name": "George",
        "lastname": "Wilson",
        "email": "george.wilson@example.com",
        "password": "passwordghi"
      },
      "status": "active",
      "start_time": new Date('2024-12-13T16:00:00.000-05:00'),
      "val_cart": 100.0
    },
    {
      "id": 10,
      "name": "Sports Meetup",
      "description": "Community sports gathering",
      "user": {
        "id": 10,
        "name": "Hannah",
        "lastname": "Moore",
        "email": "hannah.moore@example.com",
        "password": "passwordjkl"
      },
      "status": "scheduled",
      "start_time": new Date('2024-12-14T16:00:00.000-05:00'),
      "val_cart": 100.0
    }
  ]);

  // addToEvent(newEvent: EventModel) {
  //   this.eventList.set([...this.eventList(), newEvent]);
  // }
}

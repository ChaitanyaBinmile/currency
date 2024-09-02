import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import Modal from 'react-modal';

import {
  EventApi,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from '@fullcalendar/core';
import './App.css';
import { INITIAL_EVENTS } from './event-utils';

function createEventId() {
  return String(Math.random()); // Replace this with your ID generation logic
}

function App() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventClickArg | null>(null);
  const [eventCreationModalIsOpen, setEventCreationModalIsOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string; allDay: boolean } | null>(null);
  const calendarRef = useRef<FullCalendar | null>(null);

  Modal.setAppElement('#root');

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate({ start: selectInfo.startStr, end: selectInfo.endStr, allDay: selectInfo.allDay });
    setEventCreationModalIsOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setEventToDelete(clickInfo);
    setModalIsOpen(true);
  };

  const handleEvents = (events: EventApi[]) => {
    setCurrentEvents(events);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      eventToDelete.event.remove();
      setEventToDelete(null);
    }
    setModalIsOpen(false);
  };

  const handleCancelDelete = () => {
    setEventToDelete(null);
    setModalIsOpen(false);
  };

  const handleSaveEvent = () => {
    if (selectedDate && newEventTitle) {
      const calendarApi = calendarRef.current?.getApi();
      if (calendarApi) {
        calendarApi.addEvent({
          id: createEventId(),
          title: newEventTitle,
          start: selectedDate.start,
          end: selectedDate.end,
          allDay: selectedDate.allDay,
        });
      }
    }
    setNewEventTitle('');
    setSelectedDate(null);
    setEventCreationModalIsOpen(false);
  };

  const handleCancelEventCreation = () => {
    setNewEventTitle('');
    setSelectedDate(null);
    setEventCreationModalIsOpen(false);
  };

  return (
    <div className="App">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={weekendsVisible}
        initialEvents={INITIAL_EVENTS} // Alternatively, use the `events` setting to fetch from a feed
        select={handleDateSelect}
        eventContent={renderEventContent} // Custom render function
        eventClick={handleEventClick}
        eventsSet={handleEvents}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCancelDelete}
        contentLabel="Confirm Delete"
        className="Modal"
        overlayClassName="Overlay"
        shouldCloseOnOverlayClick={true} // Allow closing on overlay click
      >
        <h2>Are you sure?</h2>
        <p>Do you want to delete the event '{eventToDelete?.event.title}'?</p>
        <button onClick={handleConfirmDelete}>Yes, delete it!</button>
        <button onClick={handleCancelDelete}>Cancel</button>
      </Modal>
      <Modal
        isOpen={eventCreationModalIsOpen}
        onRequestClose={handleCancelEventCreation}
        contentLabel="Create Event"
        className="Modal"
        overlayClassName="Overlay"
        shouldCloseOnOverlayClick={true} // Allow closing on overlay click
      >
        <h2>Create New Event</h2>
        <div className='col'>
          <input
            type="text"
            placeholder="Event Title"
            value={newEventTitle}
            onChange={(e) => setNewEventTitle(e.target.value)}
          />
          <div>
            <button onClick={handleSaveEvent}>Save Event</button>
            <button onClick={handleCancelEventCreation}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function renderEventContent(eventContentArg: EventContentArg) {
  return (
    <div>
      <b>{eventContentArg.timeText}</b>
      <i>{eventContentArg.event.title}</i>
    </div>
  );
}

export default App;

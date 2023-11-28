'use client'

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, collection, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const style = {
  formWrapper: `flex flex-col h-full p-4 bg-white text-black shadow-md overflow-auto`,
  formSelect: `mb-4 p-2 border-2 border-gray-200 rounded`,
  formInput: `mb-4 p-2 border-2 border-gray-200 rounded`,
  formTextarea: `mb-4 p-2 border-2 border-gray-200 rounded`,
  formButton: `p-2 mb-2 border-2 border-gray-200 rounded cursor-pointer hover:bg-gray-100`,
  formButtonDelete: `p-2 mb-2 border-2 border-red-500 text-red-500 rounded cursor-pointer hover:bg-red-100`,
  formButtonCancel: `p-2 mb-2 border-2 border-blue-500 text-blue-500 rounded cursor-pointer hover:bg-blue-100`,
  formCheckbox: `mb-4`
};

const EventForm = ({ selectedDate, eventsOnDate, onClose, user }) => {
  const [eventData, setEventData] = useState({
    title: '',
    start: selectedDate,
    end: selectedDate,
    description: '',
    isRepeating: false,
    repeatFrequency: 'daily',
    repeatEndsOn: selectedDate
  });
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    if (eventsOnDate.length > 0) {
      setSelectedEventId(eventsOnDate[0].id);
      setEventData(eventsOnDate[0]);
    } else {
      setEventData({ 
        title: '', 
        start: selectedDate, 
        end: selectedDate, 
        description: '', 
        isRepeating: false,
        repeatFrequency: 'daily',
        repeatEndsOn: selectedDate
      });
      setSelectedEventId('');
    }
  }, [eventsOnDate, selectedDate]);

  const handleEventSelection = (e) => {
    const eventId = e.target.value;
    setSelectedEventId(eventId);
    const selectedEvent = eventsOnDate.find(event => event.id === eventId);
    if (selectedEvent) {
      setEventData(selectedEvent);
    } else {
      setEventData({
        title: '',
        start: selectedDate,
        end: selectedDate,
        description: '',
        isRepeating: false,
        repeatFrequency: 'daily',
        repeatEndsOn: selectedDate
      });
    }
  };

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setEventData({ ...eventData, isRepeating: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let data = { ...eventData, userId: user.uid };
  
    // Convert JavaScript Date objects to Firebase Timestamps
    if (data.start instanceof Date) {
      data.start = Timestamp.fromDate(data.start);
    }
    if (data.end instanceof Date) {
      data.end = Timestamp.fromDate(data.end);
    }
    if (data.repeatEndsOn instanceof Date) {
      data.repeatEndsOn = Timestamp.fromDate(data.repeatEndsOn);
    }
  
    console.log(data); // Check the data being sent
  
    const eventRef = selectedEventId
      ? doc(db, 'calendarEvents', selectedEventId)
      : collection(db, 'calendarEvents');
  
    if (selectedEventId) {
      await updateDoc(eventRef, data);
    } else {
      await addDoc(eventRef, data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (selectedEventId) {
      await deleteDoc(doc(db, 'calendarEvents', selectedEventId));
      onClose();
    }
  };

  return (
    <div className={style.formWrapper}>
      <form onSubmit={handleSubmit}>
        <select className={style.formSelect} onChange={handleEventSelection} value={selectedEventId}>
          <option value="">Create New Event</option>
          {eventsOnDate.map(event => (
            <option key={event.id} value={event.id}>{event.title}</option>
          ))}
        </select>
        <input
          className={style.formInput}
          type="text"
          name="title"
          value={eventData.title}
          onChange={handleChange}
          placeholder="Event Title"
        />
        <textarea
          className={style.formTextarea}
          name="description"
          value={eventData.description}
          onChange={handleChange}
          placeholder="Description"
        />
        {/* Repeating event checkbox */}
        <div className={style.formCheckbox}>
          <label>
            <input
              type="checkbox"
              checked={eventData.isRepeating}
              onChange={handleCheckboxChange}
            /> Repeat Event
          </label>
        </div>
        {/* Additional fields for repeating events */}
        {eventData.isRepeating && (
          <>
            <select
              className={style.formSelect}
              name="repeatFrequency"
              value={eventData.repeatFrequency}
              onChange={handleChange}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <input
              className={style.formInput}
              type="date"
              name="repeatEndsOn"
              value={eventData.repeatEndsOn}
              onChange={handleChange}
              placeholder="Repeat ends on"
            />
          </>
        )}
        <button className={style.formButton} type="submit">Save</button>
        {selectedEventId && <button className={style.formButtonDelete} type="button" onClick={handleDelete}>Delete</button>}
        <button className={style.formButtonCancel} type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

export default EventForm;


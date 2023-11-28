'use client'

import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, collection, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const style = {
  formWrapper: `flex flex-col h-full p-2 bg-white text-black shadow-md overflow-auto`,
  formSelect: `mb-4 p-2 border-2 border-gray-200 rounded`,
  formInput: `mb-4 p-2 border-2 border-gray-200 rounded`,
  formTextarea: `mb-4 p-2 border-2 border-gray-200 rounded w-full`,
  formButton: `p-2 mb-2 border-2 border-gray-200 rounded cursor-pointer hover:bg-gray-100`,
  formButtonDelete: `p-2 mb-2 border-2 border-red-500 text-red-500 rounded cursor-pointer hover:bg-red-100`,
  formButtonCancel: `p-2 mb-2 border-2 border-blue-500 text-blue-500 rounded cursor-pointer hover:bg-blue-100`,
  formCheckbox: `mb-4`
};

const EventForm = ({ selectedDate, eventsOnDate, user }) => {
  const [eventData, setEventData] = useState({
    title: '',
    date: selectedDate,
    startTime: '08:00',
    endTime: '09:00',
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
        date: selectedDate, 
        startTime: '08:00', 
        endTime: '09:00', 
        description: '', 
        isRepeating: false,
        repeatFrequency: 'daily',
        repeatEndsOn: selectedDate
      });
      setSelectedEventId('');
    }
  }, [eventsOnDate, selectedDate]);

  const handleChange = (e) => {
    if (e.target.name === "selectedEventId") {
      if (e.target.value === "") {
        // Reset the form when "Create New Event" is selected
        setEventData({
          title: '',
          date: selectedDate,
          startTime: '08:00',
          endTime: '09:00',
          description: '',
          isRepeating: false,
          repeatFrequency: 'daily',
          repeatEndsOn: selectedDate
        });
        setSelectedEventId('');
      } else {
        // Set selected event details
        const selectedEvent = eventsOnDate.find(event => event.id === e.target.value);
        setEventData(selectedEvent);
        setSelectedEventId(e.target.value);
      }
    } else {
      // Handle other form changes
      setEventData({ ...eventData, [e.target.name]: e.target.value });
    }
  };

  const handleCheckboxChange = (e) => {
    setEventData({ ...eventData, isRepeating: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Function to convert date from DD.MM.YYYY to YYYY-MM-DD format
    const formatDate = (dateString) => {
        if (!dateString) {
          throw new Error("Date string is undefined or null");
        }
      
        let parts;
        if (dateString.includes('-')) {
          // Format is YYYY-MM-DD
          parts = dateString.split('-');
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else if (dateString.includes('.')) {
          // Format is DD.MM.YYYY
          parts = dateString.split('.');
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else {
          throw new Error(`Date string is not in a recognized format: ${dateString}`);
        }
      };
      
      
  
    try {
      const formattedDate = formatDate(eventData.date);
      const startDateString = `${formattedDate}T${eventData.startTime}`;
      const endDateString = `${formattedDate}T${eventData.endTime}`;
  
      console.log("Start Date String:", startDateString);
      console.log("End Date String:", endDateString);
  
      let startDate = new Date(startDateString);
      let endDate = new Date(endDateString);
  
      if (isNaN(startDate) || isNaN(endDate)) {
        throw new Error("Invalid date or time value");
      }
  
      let data = { 
        ...eventData, 
        userId: user.uid,
        start: Timestamp.fromDate(startDate),
        end: Timestamp.fromDate(endDate),
      };
  
      if (eventData.repeatEndsOn instanceof Date) {
        data.repeatEndsOn = Timestamp.fromDate(eventData.repeatEndsOn);
      }
  
      console.log("Formatted data to be sent:", data);
  
      const eventRef = selectedEventId
        ? doc(db, 'calendarEvents', selectedEventId)
        : collection(db, 'calendarEvents');
  
      if (selectedEventId) {
        console.log(data)
        await updateDoc(eventRef, data);
      } else {
        await addDoc(eventRef, data);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };
  
  

  const handleDelete = async () => {
    if (selectedEventId) {
      await deleteDoc(doc(db, 'calendarEvents', selectedEventId));
    }
  };

  return (
    <div className={style.formWrapper}>
      <form onSubmit={handleSubmit}>
        <input
          className={style.formInput}
          type="text"
          value={selectedDate}
          readOnly
          placeholder="Selected Date (mm.dd.yyyy)"
        />
        <select 
          className={style.formSelect} 
          name="selectedEventId" // Ensure this name attribute is set
          onChange={handleChange} 
          value={selectedEventId}
        >
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
        <div className={style.formCheckbox}>
          <label>
            <input
              type="checkbox"
              checked={eventData.isRepeating}
              onChange={handleCheckboxChange}
            /> Repeat Event
          </label>
        </div>
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
        <input
          className={style.formInput}
          type="time"
          name="startTime"
          value={eventData.startTime}
          onChange={handleChange}
          placeholder="Start Time"
        />
        <input
          className={style.formInput}
          type="time"
          name="endTime"
          value={eventData.endTime}
          onChange={handleChange}
          placeholder="End Time"
          min={eventData.startTime} // Ensure end time is after start time
        />
        <button className={style.formButton} type="submit">Save</button>
        {selectedEventId && <button className={style.formButtonDelete} type="button" onClick={handleDelete}>Delete</button>}
      </form>
    </div>
  );
};

export default EventForm;



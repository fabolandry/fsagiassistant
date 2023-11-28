'use client'

import React, { useState, useEffect, useContext } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../../AuthContext';
import EventForm from './Eventform';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Sidebar from '../../components/chat/Sidebar'

const localizer = momentLocalizer(moment);

const style = {
    calendarWrapper: `flex flex-col flex-grow h-full mx-5`,
    title: `text-center m-3`,
}

const CalendarView = () => {
  const { currentUser } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const q = query(collection(db, "calendarEvents"), where("userId", "==", currentUser.uid));
      const unsubscribe = onSnapshot(q, querySnapshot => {
        const eventsFromFirestore = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          start: doc.data().start.toDate(),
          end: doc.data().end.toDate()
        }));
        setEvents(eventsFromFirestore);
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleDateClick = (date) => {
    console.log(date);
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const eventsOnDate = events.filter(event => moment(event.start).isSame(selectedDate, 'day'));

  return (
    <div className="w-full h-screen flex flex-row">
        <Sidebar />
        <div className='w-1/5'>
        <EventForm
            selectedDate={selectedDate}
            eventsOnDate={eventsOnDate}
            user={currentUser}
        />
        </div>
        <div className={style.calendarWrapper}>
            <h1 className={style.title}>Calendar</h1>
            <Calendar
                localizer={localizer}
                events={events}
                onSelectSlot={handleDateClick}
                selectable
            />
        </div>
    </div>
  );
};

export default CalendarView;


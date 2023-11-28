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
    pageWrapper: `w-full h-screen flex flex-row bg-white overscroll-none overflow-hidden`,
    calendarWrapper: `flex flex-col flex-grow h-auto mx-5 bg-white text-black text-xs w-auto`,
    title: `text-center text-lg mb-3`,
}

const CalendarView = () => {
  const { currentUser } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month'); // State for calendar view
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleNavigate = (newDate, view) => {
    setCurrentDate(newDate);
  };

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      const q = query(collection(db, "calendarEvents"), where("userId", "==", currentUser.uid));
      const unsubscribe = onSnapshot(q, querySnapshot => {
        const eventsFromFirestore = querySnapshot.docs.map(doc => {
          const eventData = doc.data();
          return {
            ...eventData,
            id: doc.id,
            start: eventData.start.toDate(), // Assuming start is a Firestore timestamp
            end: eventData.end.toDate() // Assuming end is a Firestore timestamp
          };
        });
        setEvents(eventsFromFirestore);
      });
  
      return () => unsubscribe();
    }
  }, [currentUser]);
  

  const handleDateClick = (date) => {
    console.log(date);
    const formattedDate = moment(new Date(date.start)).format('YYYY-MM-DD');
    setSelectedDate(formattedDate);
  };


  const eventsOnDate = events.filter(event => moment(event.start).isSame(selectedDate, 'day'));

  return (
    <div className={style.pageWrapper}>
        <Sidebar />
        <div className='w-1/6'>
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
                view={view}
                date={currentDate}
                onView={handleViewChange}
                onNavigate={handleNavigate}
                onSelectSlot={handleDateClick}
                selectable
                />
        </div>
    </div>
  );
};

export default CalendarView;


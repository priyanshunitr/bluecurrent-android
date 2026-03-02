import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import ClockDisplay from '../components/Schedule/ClockDisplay';
import AlarmForm from '../components/Schedule/AlarmForm';
import AlarmList from '../components/Schedule/AlarmList';
import AlarmModal from '../components/Schedule/AlarmModal';

export default function Schedule() {
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [type, setType] = useState('everyday');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [date, setDate] = useState({ d: '', m: '', y: '' });
  const [schedules, setSchedules] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null);
  
  const triggeredAlarms = useRef(new Set());

  // Heartbeat: Update clock and check for alarms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentD = now.getDay();
      const currentMonth = now.getMonth() + 1;
      const currentDate = now.getDate();
      const currentYear = now.getFullYear();

      const timeKey = `${currentH}:${currentM}`;

      schedules.forEach((s) => {
        const alarmKey = `${s.id}-${timeKey}`;
        
        if (s.hour === currentH && s.minute === currentM && !triggeredAlarms.current.has(alarmKey)) {
          let trigger = false;
          
          if (s.type === 'everyday') trigger = true;
          if (s.type === 'weekly' && s.day === currentD) trigger = true;
          if (s.type === 'particular') {
            const targetYear = s.year < 100 ? 2000 + s.year : s.year;
            if (s.date === currentDate && s.month === currentMonth && targetYear === currentYear) {
              trigger = true;
            }
          }

          if (trigger) {
            triggeredAlarms.current.add(alarmKey);
            setActiveAlarm(s);
            setShowModal(true);
          }
        }
      });

      if (currentM === 0 && now.getSeconds() === 0) {
        triggeredAlarms.current.clear();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [schedules]);

  const addSchedule = () => {
    const h = parseInt(hour);
    const m = parseInt(minute);

    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      Alert.alert('Error', 'Please enter valid time (0-23 hr, 0-59 min)');
      return;
    }

    const newSchedule = {
      id: Date.now(),
      hour: h,
      minute: m,
      type: type,
      day: selectedDay,
      date: parseInt(date.d) || 0,
      month: parseInt(date.m) || 0,
      year: parseInt(date.y) || 0,
    };

    setSchedules([...schedules, newSchedule]);
    setHour('');
    setMinute('');
    Alert.alert('Success', 'Alarm set!');
  };

  const removeSchedule = (id) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ClockDisplay currentTime={currentTime} />
      
      <AlarmForm 
        hour={hour} setHour={setHour}
        minute={minute} setMinute={setMinute}
        type={type} setType={setType}
        selectedDay={selectedDay} setSelectedDay={setSelectedDay}
        date={date} setDate={setDate}
        addSchedule={addSchedule}
      />

      <AlarmList 
        schedules={schedules} 
        removeSchedule={removeSchedule} 
      />

      <AlarmModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        activeAlarm={activeAlarm} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
});

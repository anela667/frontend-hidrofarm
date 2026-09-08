import { useState } from 'react';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import './styles/calendar.css'
import interactionPlugin from '@fullcalendar/interaction';
import { plantingApi } from './api';

const DAY_NAMES = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

function toDateStr(d) {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function formatDayHeader(d) {
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function Calendar({ plan, onActivityChanged }) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'month'
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));

  const [clickedDateEvents, setClickedDateEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editActivity, setEditActivity] = useState('');
  const [editTime, setEditTime] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [saveError, setSaveError] = useState('');

  const safePlan = Array.isArray(plan) ? plan : [];

  const events = [];
  safePlan.forEach((planItem) => {
    if (!planItem?.plant || !Array.isArray(planItem?.planting)) return;

    planItem.planting.forEach((plantingItem) => {
      const start = new Date(planItem.started_at);
      const eventDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + plantingItem.day
      );

      events.push({
        id: plantingItem.id,
        time: plantingItem.timeofday,
        plant: planItem.plant.name,
        title: plantingItem.actifity,
        date: toDateStr(eventDate),
      });
    });
  });

  const handleDateClick = (info) => {
    const eventsForDate = events.filter((event) => event.date === info.dateStr);
    setClickedDateEvents(eventsForDate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    cancelEdit();
  };

  const startEdit = (event) => {
    setSaveError('');
    setEditingId(event.id);
    setEditActivity(event.title);
    setEditTime(event.time);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditActivity('');
    setEditTime('');
    setSaveError('');
  };

  const saveEdit = async (eventId) => {
    if (!editActivity.trim() || !editTime.trim()) {
      setSaveError('Please fill in both the activity and the time of day.');
      return;
    }

    setSavingId(eventId);
    setSaveError('');
    try {
      await plantingApi.updateActivity(eventId, {
        actifity: editActivity.trim(),
        timeofday: editTime.trim(),
      });
      cancelEdit();
      onActivityChanged?.();
    } catch (err) {
      setSaveError(err.message || 'Failed to update the activity.');
    } finally {
      setSavingId(null);
    }
  };

  // Shared row renderer used by both the week view and the month modal, so
  // an activity can be edited in place instead of only being deleted.
  const renderEventRow = (event) => {
    const isEditing = editingId === event.id;

    if (isEditing) {
      return (
        <li key={event.id} className="p-3 bg-[#f4faf8] rounded-xl mb-2 border border-[#cfe3dc]">
          <p className="text-[#5f8f87] text-sm font-medium mb-2">{event.plant}</p>

          <label className="block text-xs text-[#777] mb-1">Time of day</label>
          <input
            type="text"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            className="w-full border border-[#cfe3dc] rounded-lg px-2 py-1 mb-2 text-sm outline-none"
            placeholder="e.g. Morning"
          />

          <label className="block text-xs text-[#777] mb-1">Activity</label>
          <textarea
            value={editActivity}
            onChange={(e) => setEditActivity(e.target.value)}
            rows={3}
            className="w-full border border-[#cfe3dc] rounded-lg px-2 py-1 text-sm outline-none"
          />

          {saveError && (
            <p className="text-red-500 text-xs mt-1">{saveError}</p>
          )}

          <p className="text-[10px] text-[#999] mt-2">
            Note: this schedule step is shared by every plan using this plant and method, so saving will update it everywhere it's used.
          </p>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={cancelEdit}
              className="px-3 py-1 rounded-lg bg-gray-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => saveEdit(event.id)}
              disabled={savingId === event.id}
              className="px-3 py-1 rounded-lg bg-[#5f8f87] text-white text-sm disabled:opacity-60"
            >
              {savingId === event.id ? 'Saving...' : 'Save'}
            </button>
          </div>
        </li>
      );
    }

    return (
      <li key={event.id} className="p-3 border-b last:border-b-0">
        <div className="flex justify-between items-start gap-3">
          <div>
            <p className="text-[#5f8f87] text-sm font-medium">
              {event.time} — {event.plant}
            </p>
            <p className="text-[#444] text-sm mt-1 whitespace-pre-wrap">
              {event.title}
            </p>
          </div>
          <button
            onClick={() => startEdit(event)}
            className="shrink-0 text-xs px-2 py-1 rounded-lg bg-[#eef3f1] text-[#5f8f87] hover:bg-[#dfeae5]"
          >
            Edit
          </button>
        </div>
      </li>
    );
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const goToPrevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const goToNextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const goToThisWeek = () => setWeekStart(startOfWeek(new Date()));

  return (
    <div className='relative'>

      {/* VIEW TOGGLE */}
      <div className='flex justify-between items-center mb-3'>
        <div className='flex gap-2'>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-xl text-sm transition ${viewMode === 'week' ? 'bg-[#5f8f87] text-white' : 'bg-[#eef3f1] text-[#5f8f87]'}`}
          >
            Mingguan
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 rounded-xl text-sm transition ${viewMode === 'month' ? 'bg-[#5f8f87] text-white' : 'bg-[#eef3f1] text-[#5f8f87]'}`}
          >
            Bulan
          </button>
        </div>

        {viewMode === 'week' && (
          <div className='flex items-center gap-2'>
            <button onClick={goToPrevWeek} className='w-8 h-8 rounded-lg bg-[#eef3f1] text-[#5f8f87]'>‹</button>
            <button onClick={goToThisWeek} className='px-3 py-1.5 rounded-xl text-sm bg-[#eef3f1] text-[#5f8f87]'>Minggu ini</button>
            <button onClick={goToNextWeek} className='w-8 h-8 rounded-lg bg-[#eef3f1] text-[#5f8f87]'>›</button>
          </div>
        )}
      </div>

      {viewMode === 'week' ? (
        // WEEK VIEW: shows every activity in full, for every day of the
        // week, without needing to click a day open first.
        <div className='grid grid-cols-1 gap-3 max-h-[560px] overflow-y-auto pr-1'>
          {weekDays.map((day) => {
            const dateStr = toDateStr(day);
            const dayEvents = events.filter((event) => event.date === dateStr);
            const isToday = dateStr === toDateStr(new Date());

            return (
              <div
                key={dateStr}
                className={`rounded-2xl border ${isToday ? 'border-[#5f8f87]' : 'border-[#e5e5e5]'} overflow-hidden`}
              >
                <div className={`px-4 py-2 font-medium text-sm ${isToday ? 'bg-[#5C8D89] text-white' : 'bg-[#f6f6f6] text-[#444]'}`}>
                  {formatDayHeader(day)}
                </div>
                {dayEvents.length > 0 ? (
                  <ul>
                    {dayEvents.map((event) => renderEventRow(event))}
                  </ul>
                ) : (
                  <p className='px-4 py-3 text-sm text-[#999]'>No activity scheduled.</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div style={{ display: isModalOpen ? 'block' : 'none' }} className='absolute z-20 bg-slate-300/50 rounded-xl backdrop-blur-sm w-full h-full'>
          </div>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            dayMaxEvents={2}
            headerToolbar={{
              start: "prev,next",
              center: "",
              end: "title"
            }}
          />

          {/* MODAL */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white shadow-sm rounded-xl z-50 w-[90%] max-w-[420px] max-h-[80%] overflow-y-auto' style={{ display: isModalOpen ? 'block' : 'none' }}>
            <h2 className='bg-[#5C8D89] text-white font-bold font-HelveticaNeueBold rounded-t-xl p-2 sticky top-0'>
              <div className='flex justify-between gap-20'>
                <span>Activities on {clickedDateEvents[0]?.date}</span>
                <span><button onClick={closeModal}>Close</button></span>
              </div>
            </h2>

            <div className='border'>
              {clickedDateEvents.length > 0 ? (
                <ul>
                  {clickedDateEvents.map((event) => renderEventRow(event))}
                </ul>
              ) : (
                <p className='p-2'>Tidak ada kegiatan untuk hari ini.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { KCFEvent } from '../types';
import { 
  ChevronLeft, ChevronRight, Calendar, MapPin, 
  Clock, CalendarDays, CheckCircle2, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleCalendarProps {
  events: KCFEvent[];
  getEventBadgeColor: (type: string) => string;
  getEventLabel: (type: string) => string;
}

export default function ScheduleCalendar({ 
  events, 
  getEventBadgeColor, 
  getEventLabel 
}: ScheduleCalendarProps) {
  // We initialize the calendar to June 2026 since the app events and current metadata time are in 2026.
  const today = new Date();
  const initialYear = today.getFullYear() === 2026 ? 2026 : 2026;
  const initialMonth = today.getMonth() === 5 ? 5 : 5; // June is index 5

  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth, 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-06-28'); // default to general forum date

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Format date to string: YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number): string => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Helper: check if a specific day falls in an event's date/range
  const isDateInEvent = (dayStr: string, eventDate: string): boolean => {
    if (!eventDate) return false;
    const trimmed = eventDate.trim();
    if (trimmed.includes('~')) {
      const parts = trimmed.split('~').map(p => p.trim());
      if (parts.length === 2) {
        const [start, end] = parts;
        return dayStr >= start && dayStr <= end;
      }
    }
    return dayStr === trimmed;
  };

  // Get events on a specific day string
  const getEventsForDay = (dayStr: string) => {
    return events.filter(evt => isDateInEvent(dayStr, evt.date));
  };

  // Change Month handler
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    setCurrentDate(new Date(2026, 5, 1)); // Back to June 2026
    setSelectedDateStr('2026-06-28');
  };

  // Generate calendar days
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const totalDays = new Date(year, month + 1, 0).getDate(); // Total days in this month
    const prevTotalDays = new Date(year, month, 0).getDate(); // Total days in previous month

    const days: Array<{
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      events: KCFEvent[];
    }> = [];

    // Previous month's trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dStr = formatDateStr(prevYear, prevMonth, d);
      days.push({
        day: d,
        dateStr: dStr,
        isCurrentMonth: false,
        events: getEventsForDay(dStr)
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const dStr = formatDateStr(year, month, d);
      days.push({
        day: d,
        dateStr: dStr,
        isCurrentMonth: true,
        events: getEventsForDay(dStr)
      });
    }

    // Next month's leading days to complete the grid (usually multiple of 7, e.g. 35 or 42 cells)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dStr = formatDateStr(nextYear, nextMonth, d);
      days.push({
        day: d,
        dateStr: dStr,
        isCurrentMonth: false,
        events: getEventsForDay(dStr)
      });
    }

    return days;
  }, [year, month, events]);

  // Selected date events
  const selectedEvents = useMemo(() => {
    return events.filter(evt => isDateInEvent(selectedDateStr, evt.date));
  }, [selectedDateStr, events]);

  // All events in the current displayed month
  const monthlyEvents = useMemo(() => {
    return events.filter(evt => {
      // If event overlaps with this month
      const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      if (evt.date.includes('~')) {
        const parts = evt.date.split('~').map(p => p.trim());
        if (parts.length === 2) {
          const [start, end] = parts;
          const startMonth = start.substring(0, 7);
          const endMonth = end.substring(0, 7);
          return startMonth <= currentMonthStr && endMonth >= currentMonthStr;
        }
      }
      return evt.date.substring(0, 7) === currentMonthStr;
    });
  }, [year, month, events]);

  // Helper for dot indicator styling
  const getEventDotColor = (type: KCFEvent['type']) => {
    switch (type) {
      case 'competition': return 'bg-red-500';
      case 'education': return 'bg-blue-500';
      case 'selection': return 'bg-indigo-500';
      default: return 'bg-purple-500';
    }
  };

  const formattedSelectedDateDisplay = useMemo(() => {
    const parts = selectedDateStr.split('-');
    if (parts.length === 3) {
      return `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;
    }
    return selectedDateStr;
  }, [selectedDateStr]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 1. Left Column: Interactive Month Calendar (col-span-7) */}
      <div id="interactive-calendar" className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-3xl p-5 md:p-6 shadow-xs relative overflow-hidden">
        
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-150">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-lg font-bold text-zinc-900 tracking-tight font-sans">
                {year}년 {month + 1}월
              </h4>
              <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                Cheer Calendar Grid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-zinc-50 p-1.5 rounded-xl border border-zinc-150">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
              title="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetToToday}
              className="text-[10px] px-2.5 py-1 hover:bg-white hover:shadow-xs rounded-lg text-zinc-500 hover:text-zinc-950 transition cursor-pointer font-semibold"
            >
              2026.06
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white hover:shadow-xs rounded-lg text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
              title="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <span 
              key={d} 
              className={`text-[11px] font-bold py-1.5 uppercase ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-zinc-400'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.map((cell, idx) => {
            const hasEvents = cell.events.length > 0;
            const isSelected = selectedDateStr === cell.dateStr;
            const cellDayOfWeek = idx % 7;
            
            // Text color logic
            let textColor = 'text-zinc-800';
            if (!cell.isCurrentMonth) {
              textColor = 'text-zinc-300';
            } else if (cellDayOfWeek === 0) {
              textColor = 'text-red-500';
            } else if (cellDayOfWeek === 6) {
              textColor = 'text-blue-500';
            }

            return (
              <button
                key={`${cell.dateStr}-${idx}`}
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-between p-1.5 md:p-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-zinc-900 text-white shadow-md shadow-zinc-200 ring-2 ring-offset-2 ring-zinc-900' 
                    : cell.isCurrentMonth 
                      ? hasEvents
                        ? 'bg-blue-50/60 hover:bg-blue-50 text-zinc-900 font-bold border border-blue-100/50'
                        : 'bg-white hover:bg-zinc-50'
                      : 'bg-transparent text-zinc-300 pointer-events-none'
                }`}
              >
                {/* Day number */}
                <span className={`text-xs md:text-sm font-mono font-bold leading-none ${isSelected ? 'text-white' : textColor}`}>
                  {cell.day}
                </span>

                {/* Event Dot Indicators */}
                {hasEvents && (
                  <div className="flex gap-1 justify-center items-center mt-1 w-full flex-wrap max-w-full">
                    {cell.events.slice(0, 3).map((evt, i) => (
                      <span 
                        key={evt.id} 
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-amber-400' : getEventDotColor(evt.type)
                        }`} 
                        title={evt.title}
                      />
                    ))}
                    {cell.events.length > 3 && (
                      <span className={`text-[8px] font-bold ${isSelected ? 'text-amber-400' : 'text-blue-600'}`}>+</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-6 pt-4 border-t border-zinc-100 text-[10px] text-zinc-400 font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>전국 대회</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>지도자 교육</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>국가대표 선발</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>정기 세미나</span>
          </div>
        </div>
      </div>

      {/* 2. Right Column: Day details and Monthly Summary (col-span-5) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Selected Date Details Panel */}
        <div className="bg-zinc-900 text-white rounded-3xl p-5 md:p-6 shadow-sm border border-zinc-850 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
            <h4 className="text-xs font-bold text-zinc-400 tracking-wider flex items-center gap-1.5 uppercase">
              <CalendarDays className="w-4 h-4 text-blue-400" />
              선택한 날짜의 공식 일정
            </h4>
            <span className="text-[10px] bg-zinc-800 px-2.5 py-1 rounded-full font-mono font-bold text-zinc-300">
              {selectedDateStr}
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-white tracking-tight">{formattedSelectedDateDisplay}</p>

            <AnimatePresence mode="wait">
              {selectedEvents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center space-y-2 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20"
                >
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    예정된 치어리딩 협회 공식 일정이 없습니다.
                  </p>
                  <p className="text-[10px] text-zinc-600 font-light">
                    다른 날짜를 선택하시거나 전체 일정을 확인해 보세요.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3.5">
                  {selectedEvents.map((evt) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key={evt.id}
                      className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-2xl space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-bold tracking-wide px-2 py-0.5 rounded ${getEventBadgeColor(evt.type)}`}>
                          {getEventLabel(evt.type)}
                        </span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          evt.status === 'upcoming' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          evt.status === 'ongoing' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse' :
                          'bg-zinc-800 text-zinc-500'
                        }`}>
                          {evt.status === 'upcoming' ? '대기' : evt.status === 'ongoing' ? '진행' : '완료'}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-zinc-100 group-hover:text-blue-400 transition">
                        {evt.title}
                      </h5>

                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="border-t border-zinc-850 pt-2.5 flex flex-col gap-1.5 text-[10px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-zinc-600 shrink-0" />
                          <span>일정: {evt.date}</span>
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* All Upcoming & Registered Schedules Summary Board */}
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-5 md:p-6 shadow-xs">
          <div className="border-b border-zinc-150 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <h4 className="text-xs font-bold text-zinc-900 tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              전체 공식 일정 한눈에 보기 ({events.length}건)
            </h4>
            <span className="text-[10px] text-zinc-400 font-medium">클릭 시 해당 달로 이동</span>
          </div>

          {events.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              등록된 공식 일정이 아직 없습니다.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200">
              {[...events]
                .sort((a, b) => {
                  const getCompareDate = (dateStr: string) => {
                    if (dateStr.includes('~')) {
                      return dateStr.split('~')[0].trim();
                    }
                    return dateStr.trim();
                  };
                  return getCompareDate(a.date).localeCompare(getCompareDate(b.date));
                })
                .map((evt) => {
                  // Check if the event is in the currently viewed month in the calendar
                  const currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
                  let isCurrentMonthView = false;
                  if (evt.date.includes('~')) {
                    const parts = evt.date.split('~').map(p => p.trim());
                    if (parts.length === 2) {
                      const [start, end] = parts;
                      const startMonth = start.substring(0, 7);
                      const endMonth = end.substring(0, 7);
                      isCurrentMonthView = startMonth <= currentMonthStr && endMonth >= currentMonthStr;
                    }
                  } else {
                    isCurrentMonthView = evt.date.substring(0, 7) === currentMonthStr;
                  }

                  const isSelected = selectedEvents.some(se => se.id === evt.id);

                  return (
                    <div 
                      key={evt.id}
                      onClick={() => {
                        const singleDate = evt.date.includes('~') ? evt.date.split('~')[0].trim() : evt.date;
                        setSelectedDateStr(singleDate);
                        
                        // Parse date and update calendar view month
                        const dateParts = singleDate.split('-');
                        if (dateParts.length === 3) {
                          const y = parseInt(dateParts[0]);
                          const m = parseInt(dateParts[1]) - 1;
                          setCurrentDate(new Date(y, m, 1));
                        }
                      }}
                      className={`flex items-start gap-3 p-3 rounded-2xl transition cursor-pointer border group ${
                        isSelected
                          ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                          : isCurrentMonthView
                            ? 'bg-blue-50/50 border-blue-100 hover:bg-blue-50 text-zinc-800'
                            : 'bg-zinc-50/50 border-zinc-150 hover:bg-zinc-100/70 text-zinc-800'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 transition ${
                        isSelected 
                          ? 'bg-zinc-800 text-amber-400' 
                          : 'bg-white text-zinc-400 group-hover:text-blue-500 border border-zinc-200'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-bold tracking-wide px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-zinc-800 text-white' : getEventBadgeColor(evt.type)
                          }`}>
                            {getEventLabel(evt.type)}
                          </span>
                          
                          {isCurrentMonthView && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                              isSelected ? 'bg-amber-400 text-zinc-900' : 'bg-blue-100 text-blue-700'
                            }`}>
                              이번 달 일정
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-bold transition truncate ${
                          isSelected ? 'text-white' : 'text-zinc-900 group-hover:text-blue-600'
                        }`}>
                          {evt.title}
                        </p>
                        <p className={`text-[10px] font-mono leading-none ${
                          isSelected ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          일정: {evt.date}
                        </p>
                        <p className={`text-[10px] truncate ${
                          isSelected ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          장소: {evt.location}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

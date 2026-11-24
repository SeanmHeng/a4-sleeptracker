import { Component, EventEmitter, Input, Output } from '@angular/core';
import { toLocalIso } from '../util/time';

const C = 120;   // center of the 240x240 viewBox
const R = 95;    // radius of the track
const SNAP = 5;  // minutes

/* 24-hour dial with draggable bedtime and wake-up handles. */
@Component({
  selector: 'app-sleep-dial',
  templateUrl: 'sleep-dial.component.html',
  styleUrls: ['sleep-dial.component.scss'],
})
export class SleepDialComponent {
  @Input() bedtime = '';
  @Input() wakeTime = '';
  @Output() bedtimeChange = new EventEmitter<string>();
  @Output() wakeTimeChange = new EventEmitter<string>();

  drag: 'bed' | 'wake' | null = null;
  readonly labels = [
    { text: '12 AM', min: 0 }, { text: '6 AM', min: 360 },
    { text: '12 PM', min: 720 }, { text: '6 PM', min: 1080 },
  ];

  /* Minute of the day (0-1439) for a local ISO string. */
  private minOfDay(iso: string): number {
    const d = new Date(iso);
    return d.getHours() * 60 + d.getMinutes();
  }

  /* Point on the track for a minute of the day; 12 AM is at the top, going clockwise. */
  point(min: number) {
    const a = (min / 1440) * 2 * Math.PI;
    return { x: C + R * Math.sin(a), y: C - R * Math.cos(a) };
  }

  get bed() { return this.point(this.minOfDay(this.bedtime)); }
  get wake() { return this.point(this.minOfDay(this.wakeTime)); }

  /* Minutes from bedtime to wake-up around the clock (a full circle if equal). */
  private get span(): number {
    return ((this.minOfDay(this.wakeTime) - this.minOfDay(this.bedtime) + 1440) % 1440) || 1440;
  }

  /* SVG path for the sleep arc, clockwise from bedtime to wake-up. */
  get arc(): string {
    const start = this.bed;
    const end = this.point(this.minOfDay(this.bedtime) + this.span - 0.01);
    return `M ${start.x} ${start.y} A ${R} ${R} 0 ${this.span > 720 ? 1 : 0} 1 ${end.x} ${end.y}`;
  }

  startDrag(which: 'bed' | 'wake', e: PointerEvent) {
    this.drag = which;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  endDrag() {
    this.drag = null;
  }

  /* Moves the dragged handle to the pointer; the other handle stays put, and the sleep stays within 24 h. */
  move(e: PointerEvent) {
    if (!this.drag) return;
    const rect = (e.currentTarget as Element).getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    const m = (Math.round((angle / 360) * 1440 / SNAP) * SNAP) % 1440;

    if (this.drag === 'bed') {
      const wake = new Date(this.wakeTime);
      wake.setSeconds(0, 0);
      const d = ((this.minOfDay(this.wakeTime) - m + 1440) % 1440) || 1440;
      const value = toLocalIso(new Date(wake.getTime() - d * 60000));
      if (value !== this.bedtime) this.bedtimeChange.emit(value);
    } else {
      const bed = new Date(this.bedtime);
      bed.setSeconds(0, 0);
      const d = ((m - this.minOfDay(this.bedtime) + 1440) % 1440) || 1440;
      const value = toLocalIso(new Date(bed.getTime() + d * 60000));
      if (value !== this.wakeTime) this.wakeTimeChange.emit(value);
    }
  }
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonListHeader, IonItem, IonLabel, IonNote,
  IonButton, IonDatetime, IonDatetimeButton, IonModal, IonText,
  IonSegment, IonSegmentButton, IonSpinner,
  ToastController, AlertController,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

/* Formats a Date as a local-time ISO string without a zone. */
function toLocalIso(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonListHeader, IonItem, IonLabel, IonNote,
    IonButton, IonDatetime, IonDatetimeButton, IonModal, IonText,
    IonSegment, IonSegmentButton, IonSpinner,
  ],
})
export class HomePage {
  bedtime = '';
  wakeTime = '';
  saving = false;
  loading = true;
  rating: number | null = null;
  sleepinessTime = toLocalIso(new Date());
  readonly scale = [1, 2, 3, 4, 5, 6, 7];
  readonly descriptions = StanfordSleepinessData.ScaleValues;

  constructor(
    public sleepService: SleepService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {
    this.resetNight();
  }

	/* Loads saved entries before showing the history. */
	async ngOnInit() {
		await this.sleepService.init();
		this.loading = false;
	}

	/* Returns a validation message for the sleepiness form, or null if valid. */
	get sleepinessError(): string | null {
		if (!Number.isInteger(this.rating) || this.rating! < 1 || this.rating! > 7) return 'Pick a rating';
		if (!this.sleepinessTime || new Date(this.sleepinessTime).getTime() > Date.now() + 60000) return "Time can't be in the future";
		return null;
	}

	/* Saves the selected rating, resets the form and shows a toast. */
	async saveSleepiness() {
		if (this.saving || this.sleepinessError) return;
		this.saving = true;
		try {
			const when = new Date(this.sleepinessTime);
			const message = `Logged ${this.rating} at ${when.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
			const saved = await this.sleepService.logSleepinessData(new StanfordSleepinessData(this.rating!, when)).then(() => true, () => false);
			this.rating = null;
			this.sleepinessTime = toLocalIso(new Date());
			await this.showToast(message, saved);
		} finally {
			this.saving = false;
		}
	}

	/* All logged overnight sleep entries. */
	get overnight() {
		return SleepService.AllOvernightData;
	}

	/* All logged sleepiness entries. */
	get sleepiness() {
		return SleepService.AllSleepinessData;
	}

	/* Resets bedtime/wake time to last night 11 pm and this morning 7 am (or now, if earlier). */
	resetNight() {
		const bed = new Date();
		bed.setDate(bed.getDate() - 1);
		bed.setHours(23, 0, 0, 0);
		const wake = new Date();
		wake.setHours(7, 0, 0, 0);
		this.bedtime = toLocalIso(bed);
		this.wakeTime = toLocalIso(wake > new Date() ? new Date() : wake);
	}

	/* Minutes between bedtime and wake time. */
	get sleepMinutes(): number {
		return Math.round((new Date(this.wakeTime).getTime() - new Date(this.bedtime).getTime()) / 60000);
	}

	/* Sleep duration formatted as "H h M min". */
	get sleepLabel(): string {
		return `${Math.floor(this.sleepMinutes / 60)} h ${this.sleepMinutes % 60} min`;
	}

	/* Returns a validation message for the overnight form, or null if valid. */
	get overnightError(): string | null {
		if (!this.bedtime || !this.wakeTime) return 'Pick both times';
		if (this.sleepMinutes <= 0) return 'Wake time must be after bedtime';
		if (this.sleepMinutes > 1440) return "That's more than 24 hours";
		if (new Date(this.wakeTime).getTime() > Date.now() + 60000) return "Wake time can't be in the future";
		return null;
	}

	/* Saves the overnight entry (confirming duplicates), resets the form and shows a toast. */
	async saveNight() {
		if (this.saving || this.overnightError) return;
		this.saving = true;
		try {
			const wake = new Date(this.wakeTime);
			const duplicate = this.overnight.some(n => n.sleepEnd.toDateString() === wake.toDateString());
			if (duplicate && !(await this.confirmDuplicate(wake))) return;

			const label = this.sleepLabel;
			const saved = await this.sleepService.logOvernightData(new OvernightSleepData(new Date(this.bedtime), wake)).then(() => true, () => false);
			this.resetNight();
			await this.showToast(`Night saved: ${label}`, saved);
		} finally {
			this.saving = false;
		}
	}

	/* Shows the success message, or a danger toast if the entry couldn't be written to storage. */
	private async showToast(message: string, saved: boolean) {
		const toast = await this.toastCtrl.create(saved
			? { message, duration: 2000 }
			: { message: "Couldn't save to this device — entry kept until you close the app", duration: 4000, color: 'danger' });
		await toast.present();
	}

	/* Asks the user whether to save a second night ending on the same day. */
	private async confirmDuplicate(wake: Date): Promise<boolean> {
		const day = wake.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
		const alert = await this.alertCtrl.create({
			header: 'Already logged',
			message: `You already logged a night ending ${day}.`,
			buttons: [
				{ text: 'Cancel', role: 'cancel' },
				{ text: 'Save anyway', role: 'confirm' },
			],
		});
		await alert.present();
		return (await alert.onDidDismiss()).role === 'confirm';
	}
}

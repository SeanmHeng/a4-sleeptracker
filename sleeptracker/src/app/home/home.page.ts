import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonListHeader, IonItem, IonLabel, IonNote,
  IonButton, IonDatetime, IonDatetimeButton, IonModal, IonText,
  ToastController, AlertController,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';

/* ion-datetime wants local time without a zone; toISOString() alone would shift by the UTC offset. */
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
  ],
})
export class HomePage {
  bedtime = '';
  wakeTime = '';
  saving = false;

  constructor(
    public sleepService: SleepService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
  ) {
    this.resetNight();
  }

	/* Ionic doesn't allow bindings to static variables, so these getters can be used instead. */
	get overnight() {
		return SleepService.AllOvernightData;
	}

	get sleepiness() {
		return SleepService.AllSleepinessData;
	}

	/* Defaults: last night 11 pm -> this morning 7 am (or now, if it's earlier than 7 am). */
	resetNight() {
		const bed = new Date();
		bed.setDate(bed.getDate() - 1);
		bed.setHours(23, 0, 0, 0);
		const wake = new Date();
		wake.setHours(7, 0, 0, 0);
		this.bedtime = toLocalIso(bed);
		this.wakeTime = toLocalIso(wake > new Date() ? new Date() : wake);
	}

	get sleepMinutes(): number {
		return Math.round((new Date(this.wakeTime).getTime() - new Date(this.bedtime).getTime()) / 60000);
	}

	get sleepLabel(): string {
		return `${Math.floor(this.sleepMinutes / 60)} h ${this.sleepMinutes % 60} min`;
	}

	get overnightError(): string | null {
		if (!this.bedtime || !this.wakeTime) return 'Pick both times';
		if (this.sleepMinutes <= 0) return 'Wake time must be after bedtime';
		if (this.sleepMinutes > 1440) return "That's more than 24 hours";
		if (new Date(this.wakeTime).getTime() > Date.now() + 60000) return "Wake time can't be in the future";
		return null;
	}

	async saveNight() {
		if (this.saving || this.overnightError) return;
		this.saving = true;
		try {
			const wake = new Date(this.wakeTime);
			const duplicate = this.overnight.some(n => n.sleepEnd.toDateString() === wake.toDateString());
			if (duplicate && !(await this.confirmDuplicate(wake))) return;

			this.sleepService.logOvernightData(new OvernightSleepData(new Date(this.bedtime), wake));
			const label = this.sleepLabel;
			this.resetNight();
			const toast = await this.toastCtrl.create({ message: `Night saved: ${label}`, duration: 2000 });
			await toast.present();
		} finally {
			this.saving = false;
		}
	}

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

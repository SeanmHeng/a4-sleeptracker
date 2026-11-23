import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonListHeader, IonItem, IonLabel, IonNote,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonListHeader, IonItem, IonLabel, IonNote,
  ],
})
export class HomePage {
  constructor(public sleepService:SleepService) {}

	/* Ionic doesn't allow bindings to static variables, so these getters can be used instead. */
	get overnight() {
		return SleepService.AllOvernightData;
	}

	get sleepiness() {
		return SleepService.AllSleepinessData;
	}
}

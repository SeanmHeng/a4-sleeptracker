import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

type OvernightDto = { id: string; loggedAt: string; sleepStart: string; sleepEnd: string };
type SleepinessDto = { id: string; loggedAt: string; loggedValue: number };

@Injectable({
  providedIn: 'root'
})
export class SleepService {
	private static loaded?:Promise<void>;
	private static LoadDefaultData:boolean = false;
	public static AllSleepData:SleepData[] = [];
	public static AllOvernightData:OvernightSleepData[] = [];
	public static AllSleepinessData:StanfordSleepinessData[] = [];

	constructor() {
		if(SleepService.LoadDefaultData) {
			this.addDefaultData();
		SleepService.LoadDefaultData = false;
	}
	}

	private addDefaultData() {
		var goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(1, 3, 0); //1:03am
		var wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 8 * 60 * 60 * 1000); //Sleep for exactly eight hours, waking up at 9:03am
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp)); // add that person was asleep 1am-9am yesterday
		var sleepinessDate = new Date();
		sleepinessDate.setDate(sleepinessDate.getDate() - 1); //set to yesterday
		sleepinessDate.setHours(14, 38, 0); //2:38pm
		this.logSleepinessData(new StanfordSleepinessData(4, sleepinessDate)); // add sleepiness at 2pm
		goToBed = new Date();
		goToBed.setDate(goToBed.getDate() - 1); //set to yesterday
		goToBed.setHours(23, 11, 0); //11:11pm
		wakeUp = new Date();
		wakeUp.setTime(goToBed.getTime() + 9 * 60 * 60 * 1000); //Sleep for exactly nine hours
		this.logOvernightData(new OvernightSleepData(goToBed, wakeUp));
	}

	/* Loads saved entries from device storage once; later calls reuse the same promise. */
	public init():Promise<void> {
		return SleepService.loaded ??= this.load();
	}

	/* Reads one storage key and parses it as a JSON array; corrupt data gives an empty list. */
	private async read(key:string):Promise<any[]> {
		try {
			const { value } = await Preferences.get({ key });
			return value ? JSON.parse(value) : [];
		} catch (e) {
			console.error(`Could not read saved "${key}" data`, e);
			return [];
		}
	}

	/* Rebuilds the in-memory lists from storage. */
	private async load() {
		const overnight:OvernightDto[] = await this.read('overnight');
		const sleepiness:SleepinessDto[] = await this.read('sleepiness');
		for (const d of overnight) {
			const o = new OvernightSleepData(new Date(d.sleepStart), new Date(d.sleepEnd));
			o.id = d.id;
			o.loggedAt = new Date(d.loggedAt);
			SleepService.AllOvernightData.push(o);
		}
		for (const d of sleepiness) {
			const s = new StanfordSleepinessData(d.loggedValue, new Date(d.loggedAt));
			s.id = d.id;
			SleepService.AllSleepinessData.push(s);
		}
		SleepService.AllSleepData.push(...SleepService.AllOvernightData, ...SleepService.AllSleepinessData);
	}

	/* Writes both lists to device storage; throws if the write fails. */
	public async persist():Promise<void> {
		const overnight:OvernightDto[] = SleepService.AllOvernightData.map(o => ({
			id: o.id, loggedAt: o.loggedAt.toISOString(),
			sleepStart: o.sleepStart.toISOString(), sleepEnd: o.sleepEnd.toISOString(),
		}));
		const sleepiness:SleepinessDto[] = SleepService.AllSleepinessData.map(s => ({
			id: s.id, loggedAt: s.loggedAt.toISOString(), loggedValue: s.loggedValue,
		}));
		await Preferences.set({ key: 'overnight', value: JSON.stringify(overnight) });
		await Preferences.set({ key: 'sleepiness', value: JSON.stringify(sleepiness) });
	}

	public logOvernightData(sleepData:OvernightSleepData):Promise<void> {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllOvernightData.push(sleepData);
		return this.persist();
	}

	public logSleepinessData(sleepData:StanfordSleepinessData):Promise<void> {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllSleepinessData.push(sleepData);
		return this.persist();
	}
}

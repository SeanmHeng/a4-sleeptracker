--Readme document for Sean Heng, smheng@uci.edu, 93622124--

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

10/10
- 1/1 The ability to log overnight sleep
- 1/1 The ability to log sleepiness during the day
- 1/1 The ability to view these two categories of logged data
- 2/2 Either using a native device resource or backing up logged data
- 2/2 Following good principles of mobile design
- 2/2 Creating a compelling app
- 1/1 A readme and demo video which explains how these features were implemented and their design rationale

2. How long, in hours, did it take you to complete this assignment?

10

3. What online resources did you consult when completing this assignment? (list specific URLs)

- Capacitor Preferences API (used for saving logs):
  https://capacitorjs.com/docs/apis/preferences
- Stanford Sleepiness Scale PDF hosted by UPenn (wording of the 1-7 descriptions):
  https://www.med.upenn.edu/cbti/assets/user-content/documents/Stanford%20Sleepiness%20Scale.pdf
- Ionic range slider (sleepiness slider):
  https://ionicframework.com/docs/api/range
- Ionic datetime (time pickers):
  https://ionicframework.com/docs/api/datetime
- Ionic toast (save confirmations and Undo):
  https://ionicframework.com/docs/api/toast
- Ionic sliding item (swipe to delete):
  https://ionicframework.com/docs/api/item-sliding
- Ionic color theming (custom palette):
  https://ionicframework.com/docs/theming/color
- Material Design overview (platform conventions):
  https://m3.material.io/foundations/designing/overview

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

None

5. Is there anything special we need to know in order to run your code?

From the repo root:
    cd sleeptracker
    npm install
    ionic serve

If the Ionic CLI is not installed, use "npm start" instead (serves on port 4200).

- View it at a phone size such as 390x844 in Chrome DevTools.
- Logged data is stored in the browser's localStorage, so it is lost if site
  data is cleared or in private mode.

--Aim for no more than two sentences for each of the following questions.--


6. Did you design your app with a particular type of user in mind? If so, whom?

College students who log their sleep quickly on a phone, usually in the
morning or between classes.

7. Did you design your app specifically for iOS or Android, or both?

Android: it uses Ionic's Material Design mode (md), bottom toasts, and 48 px
touch targets. It also runs in any browser.

8. How can a person log overnight sleep in your app? Why did you choose to support logging overnight sleep in this way?

They drag the bed and alarm handles on a 24-hour sleep dial, or type exact
times with the "Went to bed" and "Woke up" pickers, then tap Save night.

The times are pre-filled with last night's likely hours (11 pm to 7 am), so a
typical morning log takes one or two taps.

9. How can a person log sleepiness during the day in your app? Why did you choose to support logging sleepiness in this way?

They slide a 1-7 Stanford Sleepiness Scale slider, which shows an emoji and
the scale's description, optionally change the time (it defaults to now), and
tap Save rating.

Sleepiness is sampled many times a day, so it has to take only a few seconds,
and several entries per day are allowed.

10. How can a person view the data they logged in your app? Why did you choose to support viewing logged data in this way?

A summary card at the top shows last night's sleep and the latest sleepiness
rating, and a History section below lists every overnight and sleepiness entry.

Both categories are on the one screen, so there is no navigation to dig through.

11. Which feature choose--using a native device resource, backing up logged data, or both?

Backing up logged data.

12. If you used a native device resource, what feature did you add? How does this feature change the app's experience for a user?

N/A

13. If you backed up logged data, where does it back up to?

To the device itself through Capacitor Preferences: browser localStorage when
run on the web, and permanent native storage when run on a phone.

Entries are saved after every change and reloaded when the app starts.

14. How does your app implement or follow principles of good mobile design?

- Useful initial view: a summary card of last night and the latest sleepiness,
  plus forms that are already pre-filled.
- Uh-oh button: every entry can be deleted with a visible button or a swipe,
  and an Undo toast appears for 5 seconds. Saving a second night for the same
  day asks for confirmation.
- Error prevention: Save is disabled until the input is valid, with an inline
  message. Times in the future, a wake time before bedtime, sleeps over
  24 hours and a missing rating are all blocked.
- Platform conventions: Material Design mode, filled primary buttons, bottom
  toasts, alerts for confirmations, 48 px touch targets, and light and dark
  themes.

import * as moment from 'moment';

export class LogHelper {
  private startTime: moment.Moment;

  constructor() {
    this.startTime = moment();
  }

  start(): void {
    console.log('==================');
    console.log('Start Time');
    console.log(this.startTime.format('YYYY-MM-DD HH:mm:ss'));
    console.log('==================');
  }

  end(): number {
    const endTime = moment();
    const totalSeconds = endTime.diff(this.startTime, 'seconds');

    console.log('==================');
    console.log('End Time');
    console.log(endTime.format('YYYY-MM-DD HH:mm:ss'));
    console.log('---------------------');
    console.log('Total Seconds: ', totalSeconds);
    console.log('==================');

    return totalSeconds;
  }
}

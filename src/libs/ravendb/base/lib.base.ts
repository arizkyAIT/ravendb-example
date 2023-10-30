import * as moment from 'moment';

export const generateId = (collection: string): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  const charactersLength = characters.length;

  let randomString = '';
  Array.from(Array(6).keys()).forEach(() => {
    randomString += characters.charAt(
      Math.floor(Math.random() * charactersLength),
    );
  });

  const currentTime = moment().format('YYMMDDHHmmss');
  return `${collection.toUpperCase()}-${currentTime}-${randomString}`;
};

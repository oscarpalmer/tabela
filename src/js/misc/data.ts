import {times} from '@oscarpalmer/atoms/array';
import {getRandomBoolean, getRandomInteger, getRandomItem} from '@oscarpalmer/atoms/random';

export function getData(amount: number) {
	return times(amount, () => ({
		active: getRandomBoolean(),
		age: getRandomInteger(18, 100),
		id: getId(),
		name: {
			first: getRandomItem(firstNames),
			last: getRandomItem(lastNames),
		},
	}));
}

function getId(): number {
	id += 1;

	return id;
}

const firstNames: string[] = [
	'Aaliyah',
	'Bao',
	'Carlos',
	'Diana',
	'Elijah',
	'Fatima',
	'Grace',
	'Hiroshi',
	'Imani',
	'Jamal',
	'Keira',
	'Liam',
	'Maya',
	'Nia',
	'Omar',
	'Priya',
	'Quentin',
	'Ravi',
	'Sophia',
	'Tariq',
	'Usha',
	'Victor',
	'Wei',
	'Ximena',
	'Yara',
	'Zane',
];

const lastNames: string[] = [
	'Anderson',
	'Bautista',
	'Chen',
	'Davies',
	'Edwards',
	'Fernandez',
	'Gupta',
	'Hernandez',
	'Ito',
	'Johnson',
	'Khan',
	'Lee',
	'Martinez',
	'Nguyen',
	'Owens',
	'Patel',
	'Quinn',
	'Rodriguez',
	'Singh',
	'Tanaka',
	'Usman',
	'Vasquez',
	'Williams',
	'Xu',
	'Yilmaz',
	'Zhou',
];

let id = 0;

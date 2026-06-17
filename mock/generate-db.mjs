import { faker } from '@faker-js/faker';
import { mkdirSync, writeFileSync } from 'node:fs';

faker.seed(99);

const users = Array.from({ length: 99 }, (_, index) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: index + 1,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    username: faker.internet.username({ firstName, lastName }).toLowerCase(),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    avatar: faker.image.avatar(),
    phone: faker.phone.number(),
    jobTitle: faker.person.jobTitle(),
    company: faker.company.name(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      zipCode: faker.location.zipCode(),
    },
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    active: faker.datatype.boolean(),
  };
});

const db = {
  users,
};

mkdirSync('mock', { recursive: true });
writeFileSync('mock/db.json', `${JSON.stringify(db, null, 2)}\n`);

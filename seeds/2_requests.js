const requestsList = [
  {
    id: 1,
    title: 'Ride to the airport',
    description: 'Pick up at Pine and Broadway and drop off at Seatac; 1 person.',
    time_estimate: 2,
    timeframe: '9/1/17, 6:00 am',
    completed: false,
    user_id: 1,
    created_at: new Date('2017-08-11 14:26:16 UTC'),
    updated_at: new Date('2017-08-11 14:26:16 UTC')
  },
  {
    id: 2,
    title: 'Babysitting',
    description: 'Easy gig; look after Godot when he wakes up. Ballard.',
    time_estimate: 3,
    timeframe: '8/25/17, 1-4 pm',
    completed: false,
    user_id: 2,
    created_at: new Date('2017-08-12 14:26:16 UTC'),
    updated_at: new Date('2017-08-12 14:26:16 UTC')
  },
  {
    id: 3,
    title: 'Model for painting.',
    description: 'Just need to sit pretty for an abstract painting.',
    time_estimate: 4,
    timeframe: 'Some Saturday.',
    completed: false,
    user_id: 3,
    created_at: new Date('2017-08-13 14:26:16 UTC'),
    updated_at: new Date('2017-08-13 14:26:16 UTC')
  },
  {
    id: 4,
    title: 'Fetch gingernuts',
    description: 'Bring me some gingernuts at the office.',
    time_estimate: 1,
    timeframe: 'Morning, 8/20/17',
    completed: false,
    user_id: 4,
    created_at: new Date('2017-08-14 14:26:16 UTC'),
    updated_at: new Date('2017-08-14 14:26:16 UTC')
  },
  {
    id: 5,
    title: 'Fetch gingernuts',
    description: 'Bring me some gingernuts at the office.',
    time_estimate: 1,
    timeframe: 'Morning, 8/21/17',
    completed: false,
    user_id: 4,
    created_at: new Date('2017-08-15 14:26:16 UTC'),
    updated_at: new Date('2017-08-15 14:26:16 UTC')
  },
  {
    id: 6,
    title: 'Fetch gingernuts',
    description: 'Bring me some gingernuts at the office.',
    time_estimate: 1,
    timeframe: 'Morning, 8/22/17',
    completed: false,
    user_id: 4,
    created_at: new Date('2017-08-16 14:26:16 UTC'),
    updated_at: new Date('2017-08-16 14:26:16 UTC')
  },
  {
    id: 7,
    title: 'Fetch gingernuts',
    description: 'Bring me some gingernuts at the office.',
    time_estimate: 1,
    timeframe: 'Morning, 8/23/17',
    completed: false,
    user_id: 4,
    created_at: new Date('2017-08-17 14:26:16 UTC'),
    updated_at: new Date('2017-08-17 14:26:16 UTC')
  }
];

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('requests').del()
    .then(function () {
      // Inserts seed entries
      return knex('requests').insert(
        requestsList
      );
    })
    .then(() => {
      return knex.raw("SELECT setval('requests_id_seq', (SELECT MAX(id) FROM requests));");
    });
};

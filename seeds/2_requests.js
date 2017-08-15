const requestsList = [
  {
    id: 1,
    title: 'Ride to the airport',
    description: 'Pick up at Pine and Broadway and drop off at Seatac; 1 person.',
    time_estimate: 2,
    time_window: '9/1/17, 6:00 am',
    completed: false,
    user_id: 1,
    created_at: new Date('2017-08-10 14:26:16 UTC'),
    updated_at: new Date('2017-08-10 14:26:16 UTC')
  },
  {
    id: 2,
    title: 'Babysitting',
    description: 'Easy gig; look after Godot when he wakes up. Ballard.',
    time_estimate: 3,
    time_window: '8/25/17, 1-4 pm',
    completed: false,
    user_id: 2,
    created_at: new Date('2017-08-11 14:26:16 UTC'),
    updated_at: new Date('2017-08-11 14:26:16 UTC')
  },
  {
    id: 3,
    title: 'Model for painting.',
    description: 'Just need to sit pretty for an abstract painting.',
    time_estimate: 4,
    time_window: 'Some Saturday.',
    completed: false,
    user_id: 3,
    created_at: new Date('2017-08-12 14:26:16 UTC'),
    updated_at: new Date('2017-08-12 14:26:16 UTC')
  }

]
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
      return knex.raw("SELECT setval('requests_id_seq', (SELECT MAX(id) FROM requests));")
    });
};

const usersList = [
  { id: 1,
  first_name: 'Alfred',
  last_name: 'Prufrock',
  balance: 0,
  email: 'ajp@lovesong.com',
  tel: '2061111111',
  hashed_password: '$2a$12$rPCLzGBfiFnoTMwgvC0A/e259BWuYVXhtfSn/MmjTrNc1C0ENGw1K',  //theydonotsing
  created_at: new Date('2017-08-01 14:26:16 UTC'),
  updated_at: new Date('2017-08-01 14:26:16 UTC')
  },
  {
  id: 2,
  first_name: 'Samuel',
  last_name: 'Beckett',
  balance: 0,
  email: 'waiting@godot.com',
  tel: '2062222222',
  hashed_password: '$2a$12$oEnJjrb2XsPOTGhrn0o21.Ck5qiOXF4OIXes1rjCrbQJlRlSwoTVW',// failbetter
  created_at: new Date('2017-08-02 14:26:16 UTC'),
  updated_at: new Date('2017-08-02 14:26:16 UTC')
},
  { id: 3,
  first_name: 'Lily',
  last_name: 'Briscoe',
  balance: 0,
  email: 'lb@lighthouse.com',
  tel: '2063333333',
  hashed_password: '$2a$12$eqJeBc.Rh2i3GeIDpq1c0.Fv0UUd26/vtziZR7jBvYi.W6P3Bk95W',   // rapture
  created_at: new Date('2017-08-03 14:26:16 UTC'),
  updated_at: new Date('2017-08-03 14:26:16 UTC')
},
  {
    id: 4,
    first_name: 'Bartleby',
    last_name: '[Unknown]',
    balance: 0,
    email: 'bartleby@thescrivner.com',
    tel: '2064444444',
    hashed_password: '$2a$12$U08MGT8OhnwDcqK79J0zEe3rnvkTc8aCjoumoWxXbr66wQ9plMYVm',    // prefernotto
    created_at: new Date('2017-08-04 14:26:16 UTC'),
    updated_at: new Date('2017-08-04 14:26:16 UTC')
  }
]


exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert(
        usersList
      );
    })
    .then(() => {
    return knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));")
    });
};

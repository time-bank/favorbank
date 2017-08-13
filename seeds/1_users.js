const usersList = [
  { id: 1,
  first_name: 'Alfred',
  last_name: 'Prufrock',
  balance: 0,
  email: 'ajp@lovesong.com',
  tel: '2061111111',
  preferred_contact: 'email',
  hashed_password: '31169547937549D33C70FC8A7DAB6704506518C0F58ED7EB34001413CF5D3C47',  //theydonotsing
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
  preferred_contact: 'text',
  hashed_password: 'E50F4FB39DEEAC857D74AB29E0EE6B0401B42D5877BAFD84FB5192199E723C65',// failbetter
  created_at: new Date('2017-08-02 14:26:16 UTC'),
  updated_at: new Date('2017-08-02 14:26:16 UTC')
},
  { id: 3,
  first_name: 'Lily',
  last_name: 'Briscoe',
  balance: 0,
  email: 'lb@lighthouse.com',
  tel: '2063333333',
  preferred_contact: 'tel',
  hashed_password: 'D5B7B23E6461293A8A2B4E12C8DFBFA394E39F091F567B11F66B9BAA3FC8E338',   // rapture
  created_at: new Date('2017-08-03 14:26:16 UTC'),
  updated_at: new Date('2017-08-03 14:26:16 UTC')
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

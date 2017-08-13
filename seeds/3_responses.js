const responsesList = [
  {
    id: 1,
    request_id: 1,
    user_id: 3,
    created_at: new Date('2017-08-10 14:26:16 UTC'),
    updated_at: new Date('2017-08-10 14:26:16 UTC')
  },
  {
    id: 2,
    request_id: 2,
    user_id: 1,
    created_at: new Date('2017-08-12 14:26:16 UTC'),
    updated_at: new Date('2017-08-12 14:26:16 UTC')
  }
]

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('responses').del()
    .then(function () {
      // Inserts seed entries
      return knex('responses').insert(
        responsesList
      );
    })
    .then(() => {
      return knex.raw("SELECT setval('responses_id_seq', (SELECT MAX(id) FROM responses));")
    });
};

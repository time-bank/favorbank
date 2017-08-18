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
  },
  {
    id: 3,
    request_id: 7,
    user_id: 3,
    created_at: new Date('2017-08-15 14:26:16 UTC'),
    updated_at: new Date('2017-08-15 14:26:16 UTC')
  },
  {
    id: 4,
    request_id: 3,
    user_id: 4,
    created_at: new Date('2017-08-15 14:26:16 UTC'),
    updated_at: new Date('2017-08-15 14:26:16 UTC')
  }

]

exports.seed = function(knex, Promise) {
  return knex('responses').del()
    .then(function () {
      return knex('responses').insert(
        responsesList
      );
    })
    .then(() => {
      return knex.raw("SELECT setval('responses_id_seq', (SELECT MAX(id) FROM responses));")
    });
};

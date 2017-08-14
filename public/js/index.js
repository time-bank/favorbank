
const snacksRoot = $('#snacks')

$.getJSON('/token')
    .then((result) => {
      if(result.length > 0) {

        $('#current_user').text("Currently logged in: "+result[0].email)
      } else {
        $('#current_user').text("")
      }
    })
    .catch((err) => {
      Materialize.toast('Please login' + err.responseText, 3000);
    })


$.getJSON('/snacks')
  .then((snacks) => {
    snacks.map((s) => {
      snacksRoot.append(createSnack(s))
    })
  })
  .catch((err) => {
    Materialize.toast('Snacks ' + err.responseText, 3000);
  })



function createSnack(snack) {

  const card = $('<div>').addClass('card')
  const imgContainer = $('<div>').addClass('card-image')
  const img = $('<img>').attr('src', snack.img)
  const title = $('<span>').addClass('card-title').text(snack.name)
  const content = $('<div>').addClass('card-content')
  const desc = $('<p>').text(snack.description)

  //dynamic link generation
  const a = $('<a>').attr('href', 'snack.html?id=' + snack.id )

  imgContainer.append(img)
  imgContainer.append(title)
  card.append(imgContainer)
  content.append(desc)
  card.append(content)

  //turn card into link
  a.append(card)

  return a
}

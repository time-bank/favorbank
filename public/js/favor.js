'use strict';

$('#modalFavorSubmit').on('click', (event) => {
  console.log("hello")
  event.preventDefault();
  const favor = createFavor();
  if (favor) {
    sendFavor(favor)
  }
})

let favorId;

if (window.location.search.split('=').length === 2) {
  favorId = window.location.search.split('=')[1];
  autofillReview();
}

/* this is done by the modal's materialize javascript now.
$('#modalFavorCancel').on('click', (event) => {
  window.location.href = index.html;
})
*/


function createFavor() {
  if (favorId != undefined)
    autofillReview();
  }
  const title = $('#favorTitle').val().trim();
  const timeframe = $('#timeframe').val().trim();
  const timeEstimate = $('#estimate').val()
  const description = $('#description').val().trim();

  const data = {
    title,
    timeframe,
    timeEstimate,
    description,
  };

  console.log(data);

  if (!title) {
    Materialize.toast('Your favor request needs a title.', 3000);
    return;
  }

  if (!timeEstimate) {
    Materialize.toast('Please estimate the number of hours this favor will take.', 3000);
    return;
  }

  if (!timeframe) {
    Materialize.toast('Please enter the timeframe you have in mind. If timing doesn\'t matter, enter "Anytime."', 3000);
    return;
  }

  if (!description) {
    Materialize.toast('Please give a description of the favor you\'re requesting.', 3000);
    return;
  }

  return data
}

// function autofillReview() {
//   console.log("entered autofill")
//   $.getJSON(`requests/${favorId}`)
//     .then((favor) => {
//       $('#title').val(favor.title);
//       $('#estimate').val(favor.time_estimate);
//       $('#timeframe').val(favor.timeframe);
//       $('#description').val(favor.description)
//     })
// }

function sendFavor(data) {
  const options = {
    contentType: 'application/json',
    data: JSON.stringify(data),
    dataType: 'json'
  };

  //if existing favor is being edited, send patch
  if (favorId !== undefined) {
    options.type = 'PATCH';
    options.url = `/requests/${favorId}`;
  } else {
    //this is a new favor
    options.type = 'POST';
    options.url = '/requests'
  }

  $.ajax(options)
    .done((res) => {
      Materialize.toast('Thanks for submitting a new favor!', 3000);
      setTimeout(changeWindows('index.html'), 3000);
    })
    .fail(($xhr) => {
      Materialize.toast($xhr.responseText, 3000);
    });
}

function changeWindows(url) {
  window.location.href = url;
}

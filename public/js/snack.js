const snackId = parseInt(window.location.search.split("=")[1].toString());

$.getJSON('/token')
  .then((result) => {
    if (result.length > 0) {

      $('#current_user').text("Currently logged in: " + result[0].email)
    } else {
      $('#current_user').text("")
    }
  })
  .catch((err) => {
    Materialize.toast('Please login' + err.responseText, 3000);
  })

const options = {
  contentType: 'application/json',
  dataType: 'json',
  type: 'GET',
  url: '/snacks/' + snackId
};

$.ajax(options)
  .done((response) => {
    snack = response[0]

    const $img = $('<img>').attr('src', snack.img)
    const $name = $('<h3>').text(snack.name)
    const $description = $('<h4>').text(snack.description)

    $('#snack_root').append($img);
    $('#snack_root').append($name);
    $('#snack_root').append($description);

    //show logged in user's review
    let options = {
      contentType: 'application/json',
      dataType: 'json',
      type: 'GET',
      url: '/reviews/user/' + snackId
    };

    $.ajax(options)
      //if a review from logged in user exists
      .done((response) => {

        //show edit, delete buttons
        showUserReviewExists(response[0]);
        getRestOfReviews();
      })
      //if a review from logged in user does not exist
      .fail(($xhr) => {

        showUserReviewDoesNotExist();
        getRestOfReviews();
      })
  })
  .fail(($xhr) => {
    Materialize.toast($xhr.responseText, 3000);
  });

function getRestOfReviews() {
  //show non-logged-in user's reviews
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'GET',
    url: '/reviews/snack/' + snackId
  };

  $.ajax(options)
    .done((response) => {
      showReviews(response)
    })
    .fail(($xhr) => {
      console.log("no other reviews")
    })
}

function editText(strText) {
  //if editText was passed null, it means this function was called by POST-(as opposed to EDIT)-a-review button,
  //so let argument value determine which api call gets called via SAVE button click
  if (strText === null) {

    let $textarea = $('<textarea>').attr('placeholder', 'Your review').attr('id', 'reviewTextarea');
    $('#user_review').append($textarea);

    //add POST-this-review button
    let $btnPost = $('<a>').addClass('waves-effect waves-light btn').text('post')

    $btnPost.click((event) => {
      btnPostOnClick($textarea.val());
    })

    $('#user_review').append($btnPost)
  } else {

    let $textarea = $('<textarea>').text(strText).attr('id', 'reviewTextarea');
    $('#user_review').append($textarea);

    //add UPDATE-this-review button
    let $btnUpdate = $('<a>').addClass('waves-effect waves-light btn').text('update')

    $btnUpdate.click((event) => {
      btnUpdateOnClick($textarea.val()); //null passed for text, to force toggleTextArea to show placeholder text.
    })

    $('#user_review').append($btnUpdate)
  }
}

function showUserReviewExists(objReview) {
  $('#user_review').empty();

  let strReview = objReview.description;
  $('#user_review').append($('<h5>').text("reviewed by: " + objReview.email + ": "));
  $('#user_review').append($('<h6>').text(strReview));

  //add edit and delete buttons
  let $btnEdit = $('<a>').addClass('waves-effect waves-light btn').text('edit review')
  let $btnDelete = $('<a>').addClass('waves-effect waves-light btn').text('delete review')

  $btnEdit.click((event) => {
    $('#user_review').empty();
    editText(strReview); //null passed for text, to force toggleTextArea to show placeholder text.
  })
  $btnDelete.click((event) => {

    btnDeleteOnClick();
  })

  $('#user_review').append($btnEdit)
  $('#user_review').append($btnDelete)
}

function showUserReviewDoesNotExist() {

  $('#user_review').empty()
  //add review-this-snack button
  let $btnReview = $('<a>').addClass('waves-effect waves-light btn').text('review this snack')

  $btnReview.click((event) => {
    $('#user_review').empty();
    editText(null); //null passed for text, to force toggleTextArea to show placeholder text.
  })

  $('#user_review').append($btnReview);
}

function showReviews(reviews) {
  for (var review of reviews) {
    $('#remaining_reviews').append($('<h5>').text("reviewed by: " + review.email + ": "));
    $('#remaining_reviews').append($('<h6>').text(review.description));
    $('#remaining_reviews').append($('<div>').addClass('row'));
  }
}

function btnUpdateOnClick(strReviewText) {

  if (($('#reviewTextarea').val().trim() === "") === false) {

    let description = strReviewText;

    //update this review
    let options = {
      contentType: 'application/json',
      data: JSON.stringify({
        description
      }), //the "body"
      dataType: 'json',
      type: 'PATCH',
      url: '/reviews/' + snackId
    };

    $.ajax(options)
      .done((response) => {

        Materialize.toast("review saved", 3000);

        //restore text display of view in html
        showUserReviewExists(response[0]);
      })
      .fail(($xhr) => {
        Materialize.toast($xhr.responseText, 3000);
      })
  } else {
    Materialize.toast("You haven't written anything!", 3000);
  }
}

function btnPostOnClick(strReview) {


  if (($('#reviewTextarea').val().trim() === "") === false) {
    let description = strReview;
    //update this review
    let options = {
      contentType: 'application/json',
      data: JSON.stringify({
        description
      }), //the "body"
      dataType: 'json',
      type: 'POST',
      url: '/reviews/' + snackId
    };

    $.ajax(options)
      .done((response) => {
        Materialize.toast("review saved", 3000);

        showUserReviewExists(response[0])
      })
      .fail(($xhr) => {
        Materialize.toast($xhr.responseText, 3000);
      })
  } else {
    Materialize.toast("You haven't written anything!", 3000);
  }

}

function btnDeleteOnClick() {

  let options = {
    contentType: 'application/json',
    type: 'DELETE',
    url: '/reviews/' + snackId
  };

  $.ajax(options)
    .done((response) => {
      Materialize.toast("review deleted", 3000);

      showUserReviewDoesNotExist()
    })
    .fail(($xhr) => {
      Materialize.toast($xhr.responseText, 3000);
    })
}

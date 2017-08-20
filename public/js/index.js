'use strict';

const activeRequests = $('#active-requests');
const activeRequestUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
const myResponses = $('#my-responses');
const myResponsesUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
const myRequests = $('#my-requests');
const myRequestsUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();

$(document).ready(function(){
    // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
    $(".button-collapse").sideNav();
  });

let favorId;

$('#modalFavorAgree').on('click', (event) => {
  event.preventDefault();
  const favor = createFavor();
  if (favor) {
    console.log("before sendFavor favorId: ", favorId)
    sendFavor(favor)
  }
})

// $('#modalFavor').openModal({dismissible:false});
// $('#modalFavor').modal({
//       dismissible: true, // Modal can be dismissed by clicking outside of the modal
//       opacity: .5, // Opacity of modal background
//       inDuration: 300, // Transition in duration
//       outDuration: 200, // Transition out duration
//       startingTop: '4%', // Starting top style attribute
//       endingTop: '10%', // Ending top style attribute
//       ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
//         alert("Ready");
//         console.log(modal, trigger);
//       },
//       complete: function() { alert('Closed'); } // Callback for Modal close
//     }
//   );

function createFavor(favorId) {
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

function sendFavor(data) {
  const options = {
    contentType: 'application/json',
    data: JSON.stringify(data),
    dataType: 'json'
  };

  //if existing favor is being edited, send patch
  //(note: favorId gets defined at on edit click listener)
  console.log("before conditional favorId: ", favorId)
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
      if(favorId === undefined) {
        //setTimeout(changeWindows('index.html'), 3000);
        changeWindows('index.html');
        Materialize.toast('Thanks for submitting a new favor!', 3000);

      } else {
        Materialize.toast('Your favor has been updated.', 3000);
        modalFavorReset();
      }
    })
    .fail(($xhr) => {
      Materialize.toast($xhr.responseText, 3000);
    });
}

var modalFavorReset = function() {
  //reset
  console.log("reset")
  $('#favorTitle').val("");
  $('#labelTitle').addClass('active');
  $('#estimate').val(0);
  $('#labelEstimate').addClass('active');
  $('#timeframe').val("");
  $('#labelTimeframe').addClass('active');
  $('#description').val("");
  $('#labelDescription').addClass('active');
  favorId = undefined;
  $('#modalFavorAgree').text('submit')
}

$('#modalFavorCancel').on('click', (event) => {
  modalFavorReset();
});

function changeWindows(url) {
  //window.location.href = url;
}

//---


checkCookie();
getBalance();

getUserId()
  .then(function(userID) {
    return Promise.all([getMyRequests(userID), getMyResponses(userID)]);
  })
  .then(function([requests, responses]) {
    console.log(requests, responses);

    for (const response of responses){
      const newResponse = createEntry(response);
      myResponsesUl.append(newResponse);
    }
    myResponses.append(myResponsesUl);

    for (const request of requests) {
      const newRequest = createMyRequest(request);
      myRequestsUl.append(newRequest);
    }
    myRequests.append(myRequestsUl);

  })

$.getJSON(`/requests`)
  .then((requests) => {
    for (const request of requests) {
      const newRequest = createEntry(request);
      activeRequestUl.append(newRequest);
    }
    activeRequests.append(activeRequestUl);
  })
  .catch((err) => {
    Materialize.toast(err.responseText, 3000);
});

function getUserId() {
  return $.getJSON('/token')
  .then((res) => {
    return res.userId;
  })
  .catch((err) => {
    Materialize.toast(err.responseText, 3000);
  });
}


function addEditListener(buttonLink, requestId) {
  //populate request fields
  buttonLink.on('click', (event) => {
    editRequest(requestId)
      .then((requestToEdit) => {
        console.log("start populating modal with this response: ",requestToEdit);
        // Materialize.updateTextFields();
        $('#favorTitle').val(requestToEdit.title);
        $('#labelTitle').addClass('active');
        $('#estimate').val(requestToEdit.time_estimate);
        $('#labelEstimate').addClass('active');
        $('#timeframe').val(requestToEdit.timeframe);
        $('#labelTimeframe').addClass('active');
        $('#description').val(requestToEdit.description);
        $('#labelDescription').addClass('active');

        $('#modalFavorAgree').text('update')
        favorId = requestId;
      })
  });
}


function addModalListener(payLink, requestId, reqUserId) {
  //gets called when pay button from menu item clicked.
  payLink.on('click', (event) => {
    payLink.addClass('modal-trigger').attr('href', '#modalPay');
    addPaymentListener(payLink, requestId, reqUserId)
  })
}

function addPaymentListener(payLink, requestId, reqUserId) {
  //gets called from the agree button on pay modal.
  $('.agreePay').on('click', (event) => {
    sendPayment(requestId, reqUserId);
  });
}

//this is meant to behave on favor request modal similar to addPaymentListener with pay modal.
// ***Note to DL: this needs a different class tag*****
function submitNewRequestListener(requestId, reqUserId) {
  $('.agreePay').on('click', (event) => {
    console.log('agreePay triggered');

    updateRequest(requestId, reqUserId);
  });
}

function submitExistingRequestListener(requestId, reqUserId) {
  // ***Note to DL: this needs a different class tag*****
  $('.agreePay').on('click', (event) => {
    console.log('agreePay triggered');

    sendPayment(requestId, reqUserId);
  });
}
//---

function addRetractListener(buttonLink, responseId) {
  buttonLink.on('click', (event) => {
    event.preventDefault();
    // const response_id = event.target.id;
    retractResponse(responseId);
    changeWindows('index.html')
  });
}

function addCancelFavorListener(element, requestId) {
  element.on('click', (event) => {
    event.preventDefault();
    cancelFavor(requestId);
    changeWindows('index.html')
  })
}

function addCommitListener(buttonLink, requestId) {
  buttonLink.on('click', (event) => {
    event.preventDefault();
    commitToFavor(requestId);
    changeWindows('index.html')
  });
}

function getMyRequests(userId) {
  return $.getJSON(`/users/${userId}/requests`)
    .then((myRequests) => {
      return myRequests;
    });
}

function getMyResponses(userId) {
  return $.getJSON(`/users/${userId}/responses`)
    .then((myResponses) => {
      return myResponses;
    });
}

function createEntry(request) {
  const name = `${request.first_name} ${request.last_name}`;
  const committed = request.committed;
  let estimate = request.time_estimate;
  const responseId = request.response_id;
  const requestId = request.id;

  if (estimate === 1) {
    estimate = `${estimate} hour`;
  } else {
    estimate = `${estimate} hours`;
  }

  const newRequest = $('<li>');
  const headerDiv = $('<div>').addClass('collapsible-header');
  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const titleSpan = $('<span>').addClass('title').text(request.title);
  const nameP = $('<p>').text(name);
  const timeframeP = $('<p>').addClass('helper-absolute').text(request.timeframe);
  const estimateP = $('<p>').addClass('helper-absolute helper-lower-right-item').text(estimate);
  const actionLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const actionIcon = $('<i>').addClass('material-icons');
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const descriptionDiv = $('<div>').addClass('collection collection-item avatar helper-collapsible-body').text(request.description);
  const flexDiv = $('<div>').addClass('helper-flex-collapse');
  const button = $('<div>').addClass('collapse-content-button-text');
  const buttonLink = $('<a>');


//if own request, options to edit or delete
  if (request.isSelf) {
    //set menu item edit button to trigger modal
    buttonLink.text('edit').addClass('modal-trigger').attr('href', '#modalFavor');
    actionIcon.text('delete');

    //set global favorId so favor modal can determine post or patch
    favorId = requestId;
    //add event listener to edit link button
    addEditListener(buttonLink, requestId);
    addCancelFavorListener(actionLink, requestId);

//if user has committed to favor, option to retract offer
  } else if (committed) {
    buttonLink.text('can\'t make it').addClass('retract').attr('href', '#');
    addRetractListener(buttonLink, responseId);

//otherwise, favor is unclaimed; option to commit to do it
  } else {
    buttonLink.text(`help ${request.first_name}`).attr('href', '#').addClass('commit');
    addCommitListener(buttonLink, requestId);
    actionIcon.text('message');
  }

  avatarDiv.append(avatarIcon);
  avatarDiv.append(titleSpan);
  avatarDiv.append(nameP);
  avatarDiv.append(timeframeP);
  avatarDiv.append(estimateP);

  actionLink.append(actionIcon);
  avatarDiv.append(actionLink);

  headerDiv.append(avatarDiv);

  button.append(buttonLink);
  flexDiv.append(button);
  descriptionDiv.append(flexDiv);
  collabsibleDiv.append(descriptionDiv);

  newRequest.append(headerDiv);
  newRequest.append(collabsibleDiv);

  return newRequest;
}

function createMyRequest(request) {
  const name = request.first_name;
  const requestId = request.id;
  const reqUserId = request.request_user_id;
  // console.log('reqUserId', reqUserId);

  const newRequest = $('<li>');
  const headerDiv = $('<div>').addClass('collapsible-header');
  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const titleSpan = $('<span>').addClass('title').text(request.title);
  const timeframeP = $('<p>').addClass('helper-absolute').text(request.timeframe);
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const descriptionDiv = $('<div>').addClass('collection collection-item avatar; helper-collapsible-body').text(request.description);
  const flexCollapseDiv = $('<div>').addClass('helper-flex-collapse');
  const actionDiv = $('<div>').addClass('collapse-content-button-text');
  const cancelLink = $('<a>').text('cancel favor').attr('href', '#');

  addCancelFavorListener(cancelLink, requestId);
  responseExists(requestId)
    .then((res) => {
      if (res.isResponse) {
        const resName = res.resName;
        $('#payee').text(`Pay ${resName}`);
        const payLink = $('<a>').text('pay').attr('id', requestId);

        addModalListener(payLink, requestId, reqUserId);
        cancelLink.after(payLink);
      }
    })

  const rightItemDiv = $('<div>').addClass('helper-absolute helper-right-item');
  const flexDiv = $('<div>').addClass('helper-flex');
  const flexColDiv = $('<div>').addClass('helper-flex-col');
  const rightIcon = $('<i>').addClass('circle-right material-icons').text('account_circle');
  flexColDiv.append(rightIcon);

  if (name) {
    const messageIcon = $('<i>').addClass('material-icons helper-icon').text('message');
    const helperNameP = $('<p>').text(name)
    flexDiv.append(messageIcon);
    flexColDiv.append(helperNameP)
  } else {
    rightIcon.addClass('grey-text text-lighten-2')
  }

  flexDiv.append(flexColDiv);
  rightItemDiv.append(flexDiv);
  avatarDiv.append(rightItemDiv);
  avatarDiv.append(avatarIcon);
  avatarDiv.append(titleSpan);
  avatarDiv.append(timeframeP);

  headerDiv.append(avatarDiv);

  actionDiv.append(cancelLink);
  // actionDiv.append(payLink);

  flexCollapseDiv.append(actionDiv);

  descriptionDiv.append(flexCollapseDiv);
  collabsibleDiv.append(descriptionDiv);

  newRequest.append(headerDiv);
  newRequest.append(collabsibleDiv);

  return newRequest;
}

function retractResponse(response_id) {
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'DELETE',
    url: `/responses/${response_id}`
  }

  $.ajax(options)
    .done((res) => {
      Materialize.toast('Your offer to help has been cancelled.', 3000);
    })
    .fail(($xhr) => {
      Materialize.toast($xhr.responseText, 3000);
    });
}

function editRequest(request_id) {
  console.log("entered editRequest")
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'GET',
    url: `/requests/${request_id}`
  }

  return $.ajax(options)
    .done((res) => {
      //console.log("editRequest done happened")
      //Materialize.toast('Your offer to help has been cancelled.', 3000);
    })
    .fail(($xhr) => {
      //console.log("editRequest fail happened")
      //Materialize.toast("Could not process your request", 3000);
    });
}

function commitToFavor(request_id) {
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    url: `/requests/${request_id}/responses`
  }

  $.ajax(options)
    .then((res) => {
      Materialize.toast('Great! You\'re committed to this favor.', 3000);
    })
    .catch((err) => {
      Materialize.toast(err.responseText, 3000);
    });
}

function cancelFavor(request_id) {
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'DELETE',
    url: `/requests/${request_id}`
  }

  $.ajax(options)
    .then((res) => {
      Materialize.toast('Your favor has been successfully canceled.')
    })
    .catch((err) => {
      Materialize.toast(err.responseText, 3000)
    })
}

function sendPayment(reqId, reqUserId) {
  // console.log('reqUserId', reqUserId);
  // console.log('reqId', reqUserId);
  const actualHours = $('.actualHours').val();
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({ actualHours }),
    type: 'PATCH',
    url: `/users/${reqUserId}/requests/${reqId}`
  }
  $.ajax(options)
    .then((res) => {
      Materialize.toast(res.message, 3000);
      // setTimeout(changeWindows('index.html'), 3000);
      // changeWindows('index.html')
      window.location.href = 'index.html';
    })
    .catch((err) => {
      Materialize.toast(err.responseText, 3000)
    })
}

function getBalance(){
  let balance = $('#balance');

  getUserId()
    .then((user_id) => {
      if (!user_id) {
        balance.hide();
      }
      return $.getJSON(`/users/${user_id}/balance`);
    })
    .then((res) => {
      if (res.balance === 1) {
        balance.text(`${res.balance} hour`);
      } else {
        balance.text(`${res.balance} hours`);
      }
    })
}

function checkCookie(){
  getUserId()
    .then((user_id) => {
      if (!user_id) {
        changeWindows('signin.html');
      }
    })
}

function responseExists(reqId) {
  return $.getJSON(`/requests/${reqId}/responses`)
    .then((res) => {
      return res
    })
}

function changeWindows(url) {
  //window.location.href = url;
}

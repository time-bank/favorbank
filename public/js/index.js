'use strict';

const activeRequests = $('#active-requests');
const activeRequestUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
const myResponses = $('#my-responses');
const myResponsesUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
const myRequests = $('#my-requests');
const myRequestsUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();

getUserId()
  .then(function(userID) {
    return Promise.all([getMyRequests(userID), getMyResponses(userID)])
  })
  .then(function([requests, responses]) {
    // myResponses.empty();
    // myRequests.empty();
    console.log(requests, responses);

    for (const response of responses){
      const newResponse = createEntry(response);
      myResponsesUl.append(newResponse)
    }
    myResponses.append(myResponsesUl)

    for (const request of requests) {
      const newRequest = createMyRequest(request);
      myRequestsUl.append(newRequest);
    }
    myRequests.append(myRequestsUl)

  })

$.getJSON(`/requests`)
  .then((requests) => {
    for (const request of requests) {
      const newRequest = createEntry(request);
      activeRequestUl.append(newRequest);
    }
    activeRequests.append(activeRequestUl)
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

// $('#retract').on('click', 'a', (event) => {
//   event.preventDefault();
//
//   const response_id = event.target.id;
//   console.log(response_id);
//
//   deleteResponse(response_id)
// })

function addDeleteListener(buttonLink) {
  buttonLink.on('click', (event) => {
    event.preventDefault();
    const response_id = event.target.id;

    deleteResponse(response_id)
    })
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

  if (estimate === 1) {
    estimate = `${estimate} hour`
  } else {
    estimate = `${estimate} hours`
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
    buttonLink.text('edit').attr('href', 'favor.html');
    actionLink.attr('href', '#!');
    actionIcon.text('delete');
//if user has committed to favor, option to retract offer
  } else if (committed) {
    buttonLink.text('can\'t make it').attr('href', '#').attr('id', responseId).addClass('retract');
    addDeleteListener(buttonLink);
    window.location = 'index.html'
//otherwise, favor is unclaimed; option to commit to do it
  } else {
    buttonLink.text(`help ${request.first_name}`).attr('href', 'index.html').attr('id', 'commit');
    actionLink.attr('href', '#!');
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
  if (request.first_name) {
    const name = `${request.first_name} ${request.last_name}`;
  }
  const requestId = request.id;

  const newRequest = $('<li>');
  const headerDiv = $('<div>').addClass('collapsible-header');

  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const titleSpan = $('<span>').addClass('title').text(request.title).attr('id', requestId);
  const timeframeP = $('<p>').addClass('helper-absolute').text(request.timeframe);
  const rightItemDiv = $('<div>').addClass('helper-absolute helper-right-item');
  const flexDiv = $('<div>').addClass('helper-flex')
  // const actionLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const messageIcon = $('<i>').addClass('material-icons helper-icon').text('message');
  const flexColDiv = $('<div>').addClass('helper-flex-col');
  const rightIcon = $('<i>').addClass('circle-right material-icons').text('account_circle');

  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const descriptionDiv = $('<div>').addClass('collection collection-item avatar helper-collapsible-body').text(request.description);
  const flexCollapseDiv = $('<div>').addClass('helper-flex-collapse');
  const actionDiv = $('<div>').addClass('collapse-content-button-text');
  const cancelLink = $('<a>').text('cancel favor').attr('href', '#!');
  const payLink = $('<a>').text('pay').attr('href', '#!')

  // actionLink.append(messageIcon);
  flexColDiv.append(rightIcon);

  // flexDiv.append(actionLink);
  flexDiv.append(messageIcon);
  if (name) {
    const helperNameP = $('<p>').text(name)
    flexColDiv.append(helperNameP)
  }
  flexDiv.append(flexColDiv);
  rightItemDiv.append(flexDiv);

  avatarDiv.append(avatarIcon);
  avatarDiv.append(titleSpan);
  avatarDiv.append(timeframeP);
  avatarDiv.append(rightItemDiv);

  headerDiv.append(avatarDiv);

  actionDiv.append(cancelLink);
  actionDiv.append(payLink);

  flexCollapseDiv.append(actionDiv);

  descriptionDiv.append(flexCollapseDiv);
  collabsibleDiv.append(descriptionDiv);

  newRequest.append(headerDiv);
  newRequest.append(collabsibleDiv);

  return newRequest;
}

function deleteResponse(response_id) {
  const options = {
    contentType: 'application/json',
    dataTyle: 'json',
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

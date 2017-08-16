'use strict';

const activeRequests = $('#active-requests');
const activeRequestUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
const dashboard = $('#dashboard');

getUserId()
  .then(function(userID) {
    return Promise.all([getMyRequests(userID), getMyResponses(userID)])
  })
  .then(function([requests, responses]) {
    // console.log(requests, responses);
    for (const request of requests){
      console.log(createRequest(request));

    }

  })



$.getJSON(`/requests`)
  .then((requests) => {
    for (const request of requests) {
      const newRequest = createRequest(request);
      activeRequestUl.append(newRequest);
    }
    activeRequests.append(activeRequestUl)
  })
  .catch((err) => {
    Materialize.toast(err.responseText, 3000);
});


//to add a new response:
//$.ajax    post('/requests/:id/responses'

function createRequest(request) {
  const name = `${request.first_name} ${request.last_name}`;
  let estimate = request.time_estimate;

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
  const estimateP = $('<p>').addClass('helper-absolute helper-lower-right-item').text(`${estimate}`);
  const actionLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const actionIcon = $('<i>').addClass('material-icons');
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const descriptionDiv = $('<div>').addClass('collection collection-item avatar helper-collapsible-body').text(request.description);
  const flexDiv = $('<div>').addClass('helper-flex-collapse');
  const button = $('<div>').addClass('collapse-content-button-text');
  const buttonLink = $('<a>');

  if (request.isSelf) {
    buttonLink.text('edit').attr('href', 'favor.html');
    actionLink.attr('href', '#!');
    actionIcon.text('delete');
  } else {
    buttonLink.text('help out').attr('href', 'index.html', 'id', 'commit');
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

function getUserId() {
  return $.getJSON('/token')
  .then((res) => {
    return res.userId;
  })
  .catch((err) => {
    Materialize.toast(err.responseText, 3000);
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

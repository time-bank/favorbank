'use strict';

const activeRequests = $('#active-requests');
const activeRequestUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
// const dashboard = $('#dashboard');
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


function createEntry(request) {
  const name = `${request.first_name} ${request.last_name}`;
  const committed = request.committed;
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

//if own request, options to edit or delete
  if (request.isSelf) {
    buttonLink.text('edit').attr('href', 'favor.html');
    actionLink.attr('href', '#!');
    actionIcon.text('delete');
//if user has committed to favor, option to retract offer
  } else if (committed) {
    buttonLink.text('can\'t make it').attr('href', 'index.html', 'id', 'retract');
//otherwise, favor is unclaimed; option to commit to do it
  } else {
    buttonLink.text(`help ${request.first_name}`).attr('href', 'index.html', 'id', 'commit');
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

  const newRequest = $('<li>');
  const headerDiv = $('<div>').addClass('collapsible-header');

  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const titleSpan = $('<span>').addClass('title').text(request.title);
  const timeframeP = $('<p>').addClass('helper-absolute').text(request.timeframe);
  const rightItemDiv = $('<div>').addClass('helper-absolute helper-right-item');
  const flexDiv = $('<div>').addClass('helper-flex')
  // const actionLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const messageIcon = $('<i>').addClass('material-icons helper-icon').text('message');
  const flexColDiv = $('<div>').addClass('helper-flex-col');
  const rightIcon = $('<i>').addClass('circle-right material-icons').text('account_circle');

//all of above (only) in headerDiv
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

// ??
  // actionLink.append(actionIcon);
  // avatarDiv.append(actionLink);

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

// <div class="collapsible-header">
  // <div class="collection-item avatar helper-position-relative">
    // <i class="circle material-icons">account_circle</i>
    // <span class="title">Title of Favor Text</span>
    // <p>Name</p>
    // <p class="helper-absolute">Time From - Time To</p>

    // <div class="helper-absolute helper-right-item">
      // <div class="helper-flex">
      //   <i class="material-icons helper-icon">message</i>
      //   <div class="helper-flex-col">
      //     <i class="circle-right material-icons">account_circle</i>
//
//           <!------------------------------------------------------------------------->
//
//           <!--what user sees when nobody has volunteered to do this favor for them-->
//
//           <!--what user sees when somebody has volunteered to do this favor for them-->
//           <p>Helper Name</p>
//
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
//
// <div class="collapsible-body">
//   <div class="collection collection-item avatar helper-collapsible-body">
//     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
//     <div class="helper-flex-collapse">
//       <div class="collapse-content-button-text">
//         <a href="#">cancel this request</a>
//         <a href="#">pay</a>
//       </div>
//     </div>
//   </div>
// </div>
// </li>








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

'use strict';


const activeRequests = $('#active-requests');
const activeRequestUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
const dashboard = $('#dashboard');



//to get all active requests:
$.getJSON(`requests`)
.then((requests) => {
  // activeRequestUl.empty()

  for (const request of requests) {
    console.log(request);
    const isSelf = true;
    const newRequest = createActiveRequest(request, isSelf);
    activeRequestUl.append(newRequest);
  }
  activeRequests.append(activeRequestUl)

})


//to add a new response:
//$.ajax    post('/requests/:id/responses'

function createActiveRequest(isSelf) {
  const newRequest = $('<li>');

  const headerDiv = $('<div>').addClass('collapsible-header');
  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const title = $('<span>').addClass('title').text(`REQUEST TITLE`);
  const name = $('<p>').text(`FIRST NAME + LAST NAME`);
  const timeframe = $('<p>').addClass('helper-absolute').text(`TIMEFRAME`);
  const estimate = $('<p>').addClass('helper-absolute helper-lower-right-item').text(`NUM hours`);
  const deleteLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const deleteIcon = $('<i>').addClass('material-icons').text('delete');

  // up to here belongs in avatarDiv
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const description = $('<div>').addClass('collection collection-item avatar helper-collapsible-body').text(`DESCRIPTION TEXT`);
  const flexDiv = $('<div>').addClass('helper-flex-collapse');
  const button = $('<div>').addClass('collapse-content-button-text');
  const buttonLink = $('<a>').attr('href', 'favor.html');

  if (isSelf) {
    buttonLink.text('edit');
  } else {
    buttonLink.text('help out')
  }

  deleteLink.append(deleteIcon);
  avatarDiv.append(avatarIcon);
  avatarDiv.append(title);
  avatarDiv.append(name);
  avatarDiv.append(timeframe);
  avatarDiv.append(estimate);
  avatarDiv.append(deleteLink);
  headerDiv.append(avatarDiv);

  button.append(buttonLink);
  flexDiv.append(button);
  description.append(flexDiv);
  collabsibleDiv.append(description);

  newRequest.append(headerDiv);
  newRequest.append(collabsibleDiv);

  return newRequest;
}
// <li>
  // HEADERDIV<div class="collapsible-header">
    // AVATARDIV <div class="collection-item avatar helper-position-relative">
      // <i class="circle material-icons">account_circle</i>
      // <span class="title">Title of Favor Text</span>
      // <p>Name</p>
      //   <p class="helper-absolute">Time From - Time To</p>
        // <p class="helper-absolute helper-lower-right-item">3 Hours</p>

    //   <a href="#!" class="secondary-content"><i class="material-icons">delete</i></a>
    // </div>
  // </div>
  // COLLASIBLEDIV <div class="collapsible-body">
    // COLLABSIBLE CONTENT <div class="collection collection-item avatar helper-collapsible-body">
      // Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      // flexDiv <div class="helper-flex-collapse">
//        buttonText <div class="collapse-content-button-text">
//         </div>
//       </div>
//     </div>
//   </div>
// </li>

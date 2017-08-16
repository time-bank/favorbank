'use strict';

const activeRequests = $('#active-requests');
const activeRequestUl = $('#active-request-ul')
const dashboard = $('#dashboard');






//to get all active requests:
// $.getJSON(`requests`)
.then((requests) => {
  // createActiveRequests(requests)


})


//to add a new response:
//$.ajax    post('/requests/:id/responses'

function createActiveRequests(requests) {
  const newRequest = $('<li>');
  const headerDiv = $('<div>').addClass('collapsible-header');
  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const titleSpan = $('<span>').addClass('title').text(`REQUEST TITLE`);
  const name = $('<p>').text(`REQUESTER NAME`);
  const timeframe = $('<p>').addClass('helper-absolute').text(`TIMEFRAME`);
  const estimate = $('<p>').addClass('helper-absolute helper-lower-right-item').text(`NUM hours`);
  const deleteLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const deleteIcon = $('<i>').addClass('material-icons').text('delete');

  // up to here belongs in avatarDiv
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const collabsibleContent = $('<div>').addClass('collection collection-item avatar helper-collapsible-body').text(`DESCRIPTION TEXT`);
  const flexDiv = $('<div>').addClass('helper-flex-collapse');
  const buttonText = $('<div>').addClass('collapse-content-button-text');

}
// <li>
  // <div class="collapsible-header">
    // <div class="collection-item avatar helper-position-relative">
      // <i class="circle material-icons">account_circle</i>
      // <span class="title">Title of Favor Text</span>
      // <p>Name</p>
      //   <p class="helper-absolute">Time From - Time To</p>
        // <p class="helper-absolute helper-lower-right-item">3 Hours</p>

    //   <a href="#!" class="secondary-content"><i class="material-icons">delete</i></a>
    // </div>
  // </div>
  // <div class="collapsible-body">
    // <div class="collection collection-item avatar helper-collapsible-body">
      // Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      // <div class="helper-flex-collapse">
//         <div class="collapse-content-button-text">
//         </div>
//       </div>
//     </div>
//   </div>
// </li>

'use strict';


const activeRequests = $('#active-requests');
const activeRequestUl = $('<ul>').addClass('collapsible collection helper-collection-ul').attr("data-collapsible", "accordion").collapsible();
const dashboard = $('#dashboard');



//to get all active requests:
$.getJSON(`/requests`)
  .then((requests) => {
    // activeRequestUl.empty()

    for (const request of requests) {
      const title = request.title;
      const description = request.description;
      const name = `${request.first_name} ${request.last_name}`;
      const timeframe = request.timeframe;
      let estimate = request.time_estimate;
      const userId = request.user_id;
      const isSelf = request.isSelf;
      // const isSelf = false;

      if (estimate === 1) {
        estimate = `${estimate} hour`
      } else {
        estimate = `${estimate} hours`
      }


      const data = { title, description, name, timeframe, estimate, isSelf };


      console.log(request);
      const newRequest = createActiveRequest(data);
      activeRequestUl.append(newRequest);
    }
    activeRequests.append(activeRequestUl)

  })


//to add a new response:
//$.ajax    post('/requests/:id/responses'

function createActiveRequest(data) {
  const newRequest = $('<li>');

  const headerDiv = $('<div>').addClass('collapsible-header');
  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const title = $('<span>').addClass('title').text(data.title);
  const name = $('<p>').text(data.name);
  const timeframe = $('<p>').addClass('helper-absolute').text(data.timeframe);
  const estimate = $('<p>').addClass('helper-absolute helper-lower-right-item').text(`${data.estimate}`);
  const actionLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const actionIcon = $('<i>').addClass('material-icons');

  // up to here belongs in avatarDiv
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const description = $('<div>').addClass('collection collection-item avatar helper-collapsible-body').text(data.description);
  const flexDiv = $('<div>').addClass('helper-flex-collapse');
  const button = $('<div>').addClass('collapse-content-button-text');
  const buttonLink = $('<a>');

  if (data.isSelf) {
    buttonLink.text('edit').attr('href', 'favor.html');
    actionLink.attr('href', '#!');
    actionIcon.text('delete');
  } else {
    buttonLink.text('help out').attr('href', 'index.html', 'id', 'commit');
    actionLink.attr('href', '#!');
    actionIcon.text('message');
  }

  avatarDiv.append(avatarIcon);
  avatarDiv.append(title);
  avatarDiv.append(name);
  avatarDiv.append(timeframe);
  avatarDiv.append(estimate);

  actionLink.append(actionIcon);
  avatarDiv.append(actionLink);

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

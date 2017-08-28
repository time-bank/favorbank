'use strict';

const activeRequests = $('#active-requests');
const activeRequestUl = $('<ul>').addClass('collapsible collection helper-collection-ul helper-collection-activRequests-ul helper-collection-lowerlist-collapsible-body-ul').attr("data-collapsible", "accordion").attr('id', 'ulActiveRequests').collapsible();
const myResponses = $('#my-responses');
const myResponsesUl = $('<ul>').addClass('collapsible collection helper-collection-ul helper-collection-upperlist-ul').attr("data-collapsible", "accordion").attr('id', 'ulFavorsYoureDoing').collapsible();
const myRequests = $('#my-requests');
const myRequestsUl = $('<ul>').addClass('collapsible collection helper-collection-ul helper-collection-lowerlist-ul helper-collection-lowerlist-collapsible-body-ul').attr("data-collapsible", "accordion").attr('id', 'ulFavorsYouveAskedFor').collapsible();

$(document).ready(function() {
  // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
  $('.modal').modal();
  $(".button-collapse").sideNav();
});

let favorId = undefined;
let $itemId = undefined;

$('#tabActiveRequests').on('click', (event) => {
  $('#ulActiveRequests').empty();
  populateActiveRequestsUl();
});

$('#tabDashboard').on('click', (event) => {
  $('#ulFavorsYoureDoing').empty();
  $('#ulFavorsYouveAskedFor').empty();
  populateFavorsYouAreDoingAndFavorsYouRequestedUl();
});

$('#modalFavorAgree').on('click', (event) => {
  event.preventDefault();
  const favor = createFavor();
  if (favor) {
    sendFavor(favor)
  }
});

function createFavor() {
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

//send favor to backend
function sendFavor(data) {
  const options = {
    contentType: 'application/json',
    data: JSON.stringify(data),
    dataType: 'json'
  };

  //if existing favor is being edited, send patch
  //(note: favorId and $itemId gets defined at on addEditListener and reset with call from patch done)

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
      if (favorId === undefined) {
        res.isSelf=true;
        //let itemToAppend = createEntry(res);
        activeRequestUl.append(createEntry(res));
        myRequestsUl.append(createEntry(res));
        Materialize.toast('Thanks for submitting a new favor!', 3000, 'toast_style');
        modalFavorReset();
      } else {
        //changeWindows('index.html');
        Materialize.toast('Your favor has been updated.', 3000, 'toast_style');
        editItemDomUpdate();
        modalFavorReset();
      }
    })
    .fail(($xhr) => {
      Materialize.toast($xhr.responseText, 3000);
    });
}

//uses $itemId value to update dom
var editItemDomUpdate = function() {
  $itemId.find("#activeRequestHeaderTitle").text($('#favorTitle').val())
  $itemId.find("#activeRequestHeaderTimeframe").text($('#timeframe').val())

  var valEstimate = $('#estimate').val();
  if (valEstimate === 1) {
    valEstimate = `${valEstimate} hour`;
  } else {
    valEstimate = `${valEstimate} hours`;
  }
  $itemId.find("#activeRequestHeaderTimeEstimate").text(valEstimate);
  $itemId.find("#activeRequestDescription")[0].childNodes[0].nodeValue = ($('#description').val())
  $itemId = undefined;

}

var modalFavorReset = function() {
  //reset form fields
  $('#favorTitle').val("");
  $('#labelTitle').removeClass('active');
  $('#estimate').val(null);
  $('#labelEstimate').removeClass('active');
  $('#timeframe').val("");
  $('#labelTimeframe').removeClass('active');
  $('#description').val("");
  $('#labelDescription').removeClass('active');
  favorId = undefined;
  $('#modalFavorAgree').text('submit')
}

$('#modalFavorCancel').on('click', (event) => {
  modalFavorReset();
});

checkCookie();
getBalance();

populateFavorsYouAreDoingAndFavorsYouRequestedUl();

function populateFavorsYouAreDoingAndFavorsYouRequestedUl() {
  getUserId()
    .then(function(userID) {
      return Promise.all([getMyRequests(userID), getMyResponses(userID)]);
    })
    .then(function([requests, responses]) {

      //"favors you're doing"
      for (const response of responses) {
        const newResponse = createEntry(response);
        myResponsesUl.append(newResponse);
      }

      function calcMyResponsesHeaderHeight() {
        let upperlistHeaderHeight = $('#header-upperlist').outerHeight(true);
        return upperlistHeaderHeight;
      };

      addCollapsibleScrollListener(calcMyResponsesHeaderHeight, $(myResponsesUl), 0);
      myResponses.append(myResponsesUl);

      //"favors you've asked for"
      for (const request of requests) {
        const newRequest = createMyRequest(request);
        myRequestsUl.append(newRequest);
      }

      //--- add listener to dashboard ULs to ensure
      // collection item and their collapsible content is
      // visible in scroll, to user upon clicking them open.
      function calcMyRequestsHeaderHeight() {
        let upperUlHeight = $('.helper-collection-upperlist-ul').outerHeight(true);
        let upperlistHeaderHeight = $('#header-upperlist').outerHeight(true);
        let lowerlistHeaderHeight = $('#header-lowerlist').outerHeight(true);
        return upperUlHeight + upperlistHeaderHeight + lowerlistHeaderHeight;
      };

      addCollapsibleScrollListener(calcMyRequestsHeaderHeight, $(myRequestsUl), 48);
      myRequests.append(myRequestsUl);

      populateActiveRequestsUl();
    });
}

function populateActiveRequestsUl() {

  $.getJSON(`/requests`)
    .then((requests) => {
      for (const request of requests) {
        const newRequest = createEntry(request);
        activeRequestUl.append(newRequest);
      }

      //note: replace 48 with dynamically pulled value from css
      addCollapsibleScrollListener(null, $(activeRequestUl), 48);
      activeRequests.append(activeRequestUl);
    })
    .catch((err) => {
      Materialize.toast(err.responseText, 3000);
    });
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


function addEditListener(buttonLink, requestId) {
  //populate request fields
  buttonLink.on('click', (event) => {
    //get JSON data for clicked on item from database
    editRequest(requestId)
      .then((requestToEdit) => {

        // once data is recieved, populate the modal that opened when "edit" lin button was clicked.
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
        $itemId = buttonLink.parents("li");
      })
  });
}

function addPayModalListener(payLink, requestId, reqUserId) {
  //gets called when pay button from menu item clicked.
  payLink.on('click', (event) => {
    $('#title').val(0);
    payLink.addClass('modal-trigger').attr('href', '#modalPay');
    addPaymentListener(payLink, requestId, reqUserId)
  })
}

function addPaymentListener(payLink, requestId, reqUserId) {
  //gets called from the agree button on pay modal.
  $('.agreePay').on('click', (event) => {
    let $itemToRemove=$(payLink).parents("li");
    sendPayment(requestId, reqUserId, $itemToRemove);
  });
}

//this is meant to behave on favor request modal similar to addPaymentListener with pay modal.
// ***Note to DL: this needs a different class tag*****
/*
function submitNewRequestListener(requestId, reqUserId) {
  $('.agreePay').on('click', (event) => {


    updateRequest(requestId, reqUserId);
  });
}
*/
/*
function submitExistingRequestListener(requestId, reqUserId) {
  // ***Note to DL: this needs a different class tag*****
  $('.agreePay').on('click', (event) => {


    sendPayment(requestId, reqUserId);
  });
}
*/
//---

function addRetractListener(buttonLink, responseId) {
  buttonLink.on('click', (event) => {
    event.preventDefault();
    // const response_id = event.target.id;
    let $itemToRetract = buttonLink.parents("li");
    retractResponse(responseId, $itemToRetract);
    buttonLink.parents("li").remove();
  });
}

function addCancelFavorListener(cancelLink, requestId) {
  cancelLink.on('click', (event) => {
    event.preventDefault();
    let $itemToMove = cancelLink.parents("li");
    cancelFavor(requestId, $itemToMove);
    // window.location.href = 'index.html#dashboard';
    // window.location.reload(true)

  })
}

function addCommitListener(buttonLink, requestId) {
  buttonLink.on('click', (event) => {
    event.preventDefault();
    let $itemToMove = buttonLink.parents("li");
    commitToFavor(requestId, $itemToMove);

    //window.location.href = 'index.html#dashboard';
    //window.location.reload(true)
  });
}

//getTopOffset is a callback that will measure current header stuff that should be occcluded from calc if existing.
//pass null in place of callback function to indicate zero offset.

function addCollapsibleScrollListener(getTopOffset, $ulScroll, bottomExcess) {
  let topOffset;
  $ulScroll.click((event) => {

    if (getTopOffset !== null) {
      topOffset = getTopOffset();
    } else {
      topOffset = 0;
    }
    let upperAreaHeight = topOffset;
    let scrollExposure = $(window).height() - ($('.navbar-fixed').outerHeight(true) + $('.footer-fixed').outerHeight(true));
    let indexClickedItem = $(event.target).parents("li").index() + 1;
    let itemHeight = $(event.target).parents("li").find(".collapsible-header").outerHeight(true); //header: 85
    let scrollAmount = $(document).scrollTop(); //amount up from 0

    //if item at top of scroll, on clicking it, push down, so collection item header is fully visible:
    if (indexClickedItem * itemHeight - (scrollAmount - upperAreaHeight) < itemHeight) {
      let amountToPushDown = (scrollAmount - upperAreaHeight) - (indexClickedItem - 1) * itemHeight;
      let scrollPosition = scrollAmount - amountToPushDown;
      $('html, body').animate({
        scrollTop: scrollPosition
      }, 'slow');
    }

    let collapseBodyHeight = 185; //permits enough vertical space for text description of 255 chars max.
    let clpsBodyDistFromExposureTop = indexClickedItem * itemHeight - (scrollAmount - upperAreaHeight);
    let itemHeaderDistToExposureBottom = scrollExposure - clpsBodyDistFromExposureTop;

    //if item near bottom of scroll will be partially hidden under footer when expanded, bring it up above footer.
    console.log("collapseBodyHeight: ", collapseBodyHeight)
    console.log("itemHeaderDistToExposureBottom: ",itemHeaderDistToExposureBottom)
    if (collapseBodyHeight > itemHeaderDistToExposureBottom) {
      let amountToPushUp = collapseBodyHeight - itemHeaderDistToExposureBottom;
      let scrollPosition = scrollAmount + amountToPushUp;
      $('html, body').animate({
        scrollTop: scrollPosition + bottomExcess
      }, 'slow');
    }
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
  console.log("created from createEntry", request)
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
  const titleSpan = $('<span>').addClass('title').text(request.title).attr('id', 'activeRequestHeaderTitle');
  const nameP = $('<p>').text(name).attr('id', 'activeRequestHeaderName');
  const timeframeP = $('<p>').addClass('helper-absolute').text(request.timeframe).attr('id', 'activeRequestHeaderTimeframe');
  const estimateP = $('<p>').addClass('helper-absolute helper-lower-right-item').text(estimate).attr('id', 'activeRequestHeaderTimeEstimate');
  const actionLink = $('<a>').addClass('secondary-content').attr('href', '#!');
  const actionIcon = $('<i>').addClass('material-icons');
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const descriptionDiv = $('<div>').addClass('collection collection-item avatar').attr('id', 'activeRequestDescription').text(request.description);
  const flexDiv = $('<div>').addClass('helper-flex-collapse');
  const button = $('<div>').addClass('collapse-content-button-text');
  const buttonLink = $('<a>');


  //if own request, options to edit or delete
  if (request.isSelf) {
    //set menu item edit button to trigger modal
    buttonLink.text('edit').addClass('modal-trigger').attr('href', '#modalFavor');
    actionIcon.text('delete');

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

  const newRequest = $('<li>');
  const headerDiv = $('<div>').addClass('collapsible-header');
  const avatarDiv = $('<div>').addClass('collection-item avatar helper-position-relative');
  const avatarIcon = $('<i>').addClass('circle material-icons').text('account_circle');
  const titleSpan = $('<span>').addClass('title').text(request.title).attr('id', 'title');
  const timeframeP = $('<p>').addClass('helper-absolute').text(request.timeframe);
  const collabsibleDiv = $('<div>').addClass('collapsible-body');
  const descriptionDiv = $('<div>').addClass('collection collection-item avatar').text(request.description);
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

        addPayModalListener(payLink, requestId, reqUserId);
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
    const helperNameP = $('<p>').text(name).attr('id','helperName')
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

function retractResponse(response_id, $itemToRetract) {
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'DELETE',
    url: `/responses/${response_id}`
  }

  $.ajax(options)
    .done((res) => {
      $itemToRetract.remove();
      // let $toastContent = $('<span>Your offer to help has been cancelled.</span>').addClass('.center-align')
      Materialize.toast('Your offer to help has been cancelled.', 3000, 'toast_style');
    })
    .fail(($xhr) => {
      Materialize.toast($xhr.responseText, 3000);
    });
}

function editRequest(request_id) {
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


function commitToFavor(request_id, $itemToMove) {
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'POST',
    url: `/requests/${request_id}/responses`
  }

  $.ajax(options)
    .then((res) => {
      //remove item from active requests UL, attach it to favors you're doing UL, and show user toast
      $itemToMove.remove();
      //$('#ulFavorsYoureDoing').append($itemToMove);
      //append this favor to the

      Materialize.toast('Great! You have committed to this this favor. \<br>\ It has been moved to your dashboard.', 3000, 'toast_style');

    })
    .catch((err) => {
      Materialize.toast(err.responseText, 3000);
    });
}

function cancelFavor(request_id, $itemToMove) {
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    type: 'DELETE',
    url: `/requests/${request_id}`
  }

  $.ajax(options)
    .then((res) => {
      $itemToMove.remove();
      //ulActiveRequestsAppendLastFromDb(); //$('#ulActiveRequests').append($itemToMove);

      //reflect updated item in DOM for ActiveRequests UL
      Materialize.toast('Your favor has been successfully canceled.', 3000, 'toast_style');
    })
    .catch((err) => {
      Materialize.toast(err.responseText, 3000)
    })
}

function sendPayment(reqId, reqUserId, $itemToRemove) {
  const actualHours = $('.actualHours').val();
  const options = {
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({
      actualHours
    }),
    type: 'PATCH',
    url: `/users/${reqUserId}/requests/${reqId}`
  }
  $.ajax(options)
    .then((res) => {
      let namePayee = $('#helperName').text();
      Materialize.toast(`You have paid ${actualHours} hour(s) to ${namePayee}.`, 3000, 'toast_style');
      $itemToRemove.remove();
      getBalance();

      // window.location.href = 'index.html#dashboard';
      // window.location.reload(true)
      // setTimeout(Materialize.toast("Paid!", 3000), 250);
    })
    .catch((err) => {
      Materialize.toast(err.responseText, 3000)
    })
}

function getBalance() {
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

function checkCookie() {
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
  window.location.href = url;
}

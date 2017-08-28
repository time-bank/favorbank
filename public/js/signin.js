$('#form').submit((event) => {
  event.preventDefault();

  const email = $('#email').val().trim();
  const password = $('#password').val();

  const options = {
      contentType: 'application/json',
      data: JSON.stringify({ email, password }), //the "body"
      dataType: 'json',
      type: 'POST',
      url: '/token'
    };

    $.ajax(options)
      .done(() => {
        Materialize.toast('Success!', 3000);
        setTimeout(changeWindows('index.html'), 3000)
      })
      .fail(($xhr) => {
        Materialize.toast($xhr.responseText, 3000);
      });

});

function changeWindows(url) {
  window.location.href = url;
}

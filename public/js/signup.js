$('#form').submit((event) => {
  console.log('submit handler called');
  event.preventDefault();

  const email = $('#email').val().trim();
  const password = $('#password').val();
  const firstName = $('#firstName').val().trim();
  const lastName = $('#lastName').val().trim();
  const data = { email, password, firstName, lastName };

  const options = {
      contentType: 'application/json',
      data: JSON.stringify(data), //the "body"
      dataType: 'json',
      type: 'POST',
      url: '/users'
    };

    $.ajax(options)
      .done((res) => {
        Materialize.toast("Registration success", 3000);
        setTimeout(changeWindows('signin.html'), 3000)
       })
      .fail(($xhr) => {
        Materialize.toast($xhr.responseText, 3000);
      });
});

function changeWindows(url) {
  window.location.href = url;
}

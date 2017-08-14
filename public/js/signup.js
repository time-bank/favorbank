$('#form').submit((event) => {
  event.preventDefault();

  

  const email = $('#email').val().trim();
  const password = $('#password').val();

  const options = {
      contentType: 'application/json',
      data: JSON.stringify({ email, password }), //the "body"
      dataType: 'json',
      type: 'POST',
      url: '/register'
    };

    $.ajax(options)
      .done(() => {
        window.location.href = '/login.html';
        Materialize.toast("Registration success", 3000);
      })
      .fail(($xhr) => {
        Materialize.toast($xhr.responseText, 3000);
      });
});

/*global Binder: false*/
function sendRequest(data) {
  var url = '/cabletypes/';
  var type = 'POST';
  $('form[name="cabletype"]').fadeTo('slow', 0.2);
  $.ajax({
    url: url,
    type: type,
    async: true,
    data: JSON.stringify(data),
    contentType: 'application/json',
    processData: false
  }).done(function (json, textStatus, jqXHR) {
    $('#message').append('<div class="alert alert-success"><button class="close" data-dismiss="alert">x</button>' + jqXHR.responseText + '</div>');
  }).fail(function (jqXHR, status, error) {
    // TODO change to modal
    console.log(status);
    console.log(error);
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>The save request failed. You might need to try again or contact the admin.</div>');
    $('form[name="request"]').fadeTo('slow', 0);
  });
}


function naming(conductorNumber, conductorSize, fribType, typeNumber) {
  return conductorNumber + 'C_' + conductorSize + '_' + fribType + '_' + typeNumber;
}

$(function () {
  // keyup and mouseup catch all the change event
  $('#conductor-number, #conductor-size, #frib-type, #type-number').bind('keyup mouseup', function () {
    $('#name').val(naming($('#conductor-number').val(), $('#conductor-size').val(), $('#frib-type').val(), $('#type-number').val()));
  });

  var form = document.forms[0];

  var validator = $(form).validate({
    errorElement: 'span',
    errorClass: 'error',
    validClass: 'success',
    errorPlacement: function (error, element) {
      error.appendTo($(element).closest('.controls'));
    },
    highlight: function (element) {
      $(element).closest('.control-group').removeClass('success').addClass('error');
    },
    success: function (element) {
      $(element).closest('.control-group').removeClass('error').addClass('success');
    }
  });

  validator.form();

  var binder = new Binder.FormBinder(form);

  $('#submit').click(function (e) {
    e.preventDefault();
    var currentModel = binder.serialize();

    if ($(form).valid()) {
      sendRequest(currentModel);
    } else {
      $('#modalLabel').html('The request is not validated');
      $('#modal .modal-body').html('The form has ' + validator.numberOfInvalids() + ' invalid input(s) to fix.');
      $('#modal').modal('show');
      return;
    }
  });
});

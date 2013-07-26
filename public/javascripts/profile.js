$(function(){
  var sub = $('#sub').prop('checked');
  $('#modify').click(function(e){
    if ($('#sub').prop('checked') === sub) {
      $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>The subscription state was not changed.</div>');
    } else {
      sub = $('#sub').prop('checked');
      var request = $.ajax({
        url: 'profile',
        type: 'PUT',
        async: true,
        data: JSON.stringify({subscribe: sub}),
        contentType: 'application/json',
        processData: false,
        dataType: 'json'
      }).done(function(json) {
        var timestamp = request.getResponseHeader('Date');
        var dateObj = moment(timestamp);
        $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>The modiciation was saved at ' + dateObj.format('HH:mm:ss') + '.</div>');
      }).fail(function(jqXHR, status, error) {
        // TODO change to modal
        alert('The save request failed. You might need to try again or contact the admin.');
      }).always(function() {
      });
    }
    e.preventDefault();
  });
});
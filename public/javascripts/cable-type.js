$(function() {
  var aaData;
  $.ajax({
    url: '/cabeltype/all',
    type: 'GET',
    dataType: 'json'
  }).done(function(json){
    aaData = json;
  }).fail(function(jqXHR, status, error){
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for user information.</div>');
  }).always();
});
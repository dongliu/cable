$(function(){
  $.ajax({
      url: '/cables/' + $('#cableId').text() + '/json',
      type: 'GET',
      async: true,
      dataType: 'json'
    }).done(function(json) {
      $('#cableObject').html(json2List(json));

    }).fail(function(jqXHR, status, error) {
      alert('Cannot find the cable.');
    }).always(function() {
    });

});
$(function(){
  init();
  var sysSub, signal;
  // fetch sys-sub
  $.ajax({
    url: '/sys-sub',
    type: 'GET',
    dataType: 'json',
  }).done(function(json){
    sysSub = json;
    updateSystem(sysSub);
  }).fail(function(jqXHR, status, error){
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for numbering information.</div>');
  }).always(function(){
    // nothing to do here for now
  });  

  // fetch signal
  $.ajax({
    url: '/signal',
    type: 'GET',
    dataType: 'json',
  }).done(function(json){
    signal = json;
  }).fail(function(jqXHR, status, error){
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for numbering information.</div>');
  }).always(function(){
    // nothing to do here for now
  });
  
  $('#system').change(function(){
    updateSub(sysSub);
  });
});

function init() {
  // $('#system').prop('selectedIndex', -1);
  // $('#sub').prop('selectedIndex', -1);
  // $('#signal').prop('selectedIndex', -1);
}

function updateSystem(json) {
  $('#system').prop('disabled', false);
  $.each(json, function(k, v) {
    $('#system').append($('<option>', {
      value: v['name']
    }).text(k));
  });
  // updateSub(json);
}

function updateSub(json){
  var sys = $('#system option:selected').text();
  $('#sub').prop('disabled', false);
  $('#sub option').remove();
  $.each(json[sys]['sub-system'], function(k, v){
    if (v) {
      $('#sub').append($('<option>', {
        value: v['name']
      }).text(k));
    }
  });
}
$(function() {
  fnAddFilterFoot('#cable-type', typeColumns);
  var cabletype = $('#cable-type').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: typeColumns,
    sDom: sDom,
    oTableTools: oTableTools
  });

  addEvents();

  $.ajax({
    url: '/cabletypes/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    cabletype.fnClearTable();
    cabletype.fnAddData(json);
    cabletype.fnDraw();
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable type information.</div>');
  }).always();
});
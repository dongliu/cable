$(function() {
  var cabletype = $('#cable-type').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: typeColumns,
    sDom: sDom,
    oTableTools: oTableTools
  });
  fnAddFilterFoot('#cable-type', typeColumns);
  $.ajax({
    url: '/cabletypes/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    cabletype.fnClearTable();
    cabletype.fnAddData(json);
    cabletype.fnDraw();
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for user information.</div>');
  }).always();
});
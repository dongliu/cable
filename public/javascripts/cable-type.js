/*global fnAddFilterFoot: false, typeColumns: false, sDom: false, oTableTools: false, filterEvent: false*/

$(function () {
  fnAddFilterFoot('#cable-type', typeColumns);
  var cabletype = $('#cable-type').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: typeColumns,
    sDom: sDom,
    aaSorting: [
      [2, 'asc'],
      [0, 'asc']
    ],
    oTableTools: oTableTools
  });

  filterEvent();

  $.ajax({
    url: '/cabletypes/json',
    type: 'GET',
    dataType: 'json'
  }).done(function (json) {
    cabletype.fnClearTable();
    cabletype.fnAddData(json);
    cabletype.fnDraw();
  }).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable type information.</div>');
  }).always();
});

$(function() {
  // var columns = [idColumn].concat(typeColumns);
  var columns = typeColumns;
  fnAddFilterFoot('#cable-type', columns);
  var cabletype = $('#cable-type').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: columns,
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

    $('td', cabletype.fnGetNodes()).editable(function(value, settings) {
      console.log(this);
      console.log(value);
      console.log(cabletype.fnGetData(this));
      console.log(cabletype.fnGetData(this.parentNode)._id);
      console.log(columns[cabletype.fnGetPosition( this )[2]].mData);
      console.log(settings);
      var aPos = cabletype.fnGetPosition(this);
      cabletype.fnUpdate(value, aPos[0], aPos[1]);
      return (value);
    }, {
      type: 'textarea',
      cancel: 'Cancel',
      submit: 'Update',
      tooltip: 'Click to edit ... '
    });
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable type information.</div>');
  }).always();
});
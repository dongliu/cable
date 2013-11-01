$(document).ajaxError(function(event, jqxhr) {
  if (jqxhr.status == 401) {
    document.location.href = window.location.pathname;
  }
});

var columns = typeColumns;
$(function() {
  fnAddFilterFoot('#cable-type', columns);
  var cabletype = $('#cable-type').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: columns,
    sDom: sDom,
    oTableTools: oTableTools
  });

  addEvents();

  $('#add').click(function(e) {
    $.ajax({
      url: '/cabletypes',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        name: 'newtype'
      }),
      dataType: 'json'
    }).done(function(json) {
      var newType = cabletype.fnAddDataAndDisplay(json);
      $(cabletype.fnGetNodes(newType.iPos)).addClass('row-selected');
      tdEdit(cabletype);
    }).fail(function(jqXHR, status, error) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot create a new cable type : ' + jqXHR.responseText + '</div>');
    }).always();
    // tdEdit(cabletype);
  });

  $.ajax({
    url: '/cabletypes/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    cabletype.fnClearTable();
    cabletype.fnAddData(json);
    cabletype.fnDraw();
    tdEdit(cabletype);
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable type information.</div>');
  }).always();
});

function tdEdit(oTable) {
  $('td', oTable.fnGetNodes()).editable(function(value, settings) {
    var that = this;
    if (value == oTable.fnGetData(that)) {
      return value;
    }
    var data = {};
    data['target'] = columns[oTable.fnGetPosition(that)[2]].mData;
    data['update'] = value;
    data['original'] = oTable.fnGetData(that);
    var ajax = $.ajax({
      url: '/cabletypes/' + oTable.fnGetData(that.parentNode)._id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function(data) {
        var aPos = oTable.fnGetPosition(that);
        oTable.fnUpdate(value, aPos[0], aPos[1]);
        oTable.fnDisplayRow(that.parentNode);
        // $(that).text(value);
      },
      error: function(jqXHR, status, error) {
        $(that).text(oTable.fnGetData(that));
        oTable.fnDisplayRow(that.parentNode);
        $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot update the cable type : ' + jqXHR.responseText + '</div>');
        $(window).scrollTop($('#message div:last-child').offset().top - 40);
      }
    });
    return value;
  }, {
    type: 'textarea',
    cancel: 'Cancel',
    submit: 'Update',
    indicator: 'Updating...',
    placeholder: ''
  });
}
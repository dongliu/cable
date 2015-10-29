/*global fnAddFilterFoot: false, typeColumns: false, sDom: false, oTableTools: false, filterEvent: false*/
/*global window: false*/

$(document).ajaxError(function (event, jqxhr) {
  if (jqxhr.status === 401) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Please click <a href="/" target="_blank">home</a>, log in, and then save the changes on this page.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }
});

// var columns = typeColumns;

function tdEdit(oTable) {
  $('td', oTable.fnGetNodes()).editable(function (value, settings) {
    var that = this;
    if (value === oTable.fnGetData(that)) {
      return value;
    }
    var data = {};
    data.target = typeColumns[oTable.fnGetPosition(that)[2]].mData;
    data.update = value;
    data.original = oTable.fnGetData(that);
    if (data.original === '') {
      data.original = null;
    }
    if (data.update === '') {
      data.update = null;
    }
    var ajax = $.ajax({
      url: '/cabletypes/' + oTable.fnGetData(that.parentNode)._id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (data) {
        var aPos = oTable.fnGetPosition(that);
        oTable.fnUpdate(value, aPos[0], aPos[1]);
        oTable.fnDisplayRow(that.parentNode);
        // $(that).text(value);
      },
      error: function (jqXHR, status, error) {
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

$(function () {
  fnAddFilterFoot('#cable-type', typeColumns);
  var cabletype = $('#cable-type').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: typeColumns,
    sDom: sDom,
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
    tdEdit(cabletype);
  }).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable type information.</div>');
  }).always();
});

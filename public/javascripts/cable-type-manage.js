$(document).ajaxError(function(event, jqxhr){
  if (jqxhr.status == 401) {
    document.location.href = window.location.pathname;
  }
});

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
      var that = this;
      if (value == cabletype.fnGetData(that)) {
        return value;
      }
      var data = {};
      data['target'] = columns[cabletype.fnGetPosition(that)[2]].mData;
      data['update'] = value;
      data['original'] = cabletype.fnGetData(that);
      var ajax = $.ajax({
        url: '/cabletypes/'+cabletype.fnGetData(that.parentNode)._id,
        type: 'PUT',
        async: true, // have to make this sync in order to sync the client state and server state
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(data) {
          var aPos = cabletype.fnGetPosition(that);
          cabletype.fnUpdate(value, aPos[0], aPos[1]);
          // $(that).text(value);
        },
        error: function(jqXHR, status, error) {
          $(that).text(cabletype.fnGetData(that));
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
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable type information.</div>');
  }).always();
});
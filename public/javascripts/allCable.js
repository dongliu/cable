/*global fnAddFilterFoot: false, typeColumns: false, sDom: false, oTableTools: false, filterEvent: false*/
/*global window: false*/
$(function () {
  $(document).ajaxError(function (event, jqxhr) {
    if (jqxhr.status === 401) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Please click <a href="/" target="_blank">home</a>, log in, and then save the changes on this page.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }
  });
  var allAoColumns = [numberColumn, requestNumberColumn, statusColumn, versionColumn, updatedOnLongColumn, approvedOnLongColumn, submittedByColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), ownerProvidedColumn, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);

  var allTable = $('#all-cable').dataTable({
    sAjaxSource: '/allcables/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    iDisplayLength: 25,
    aLengthMenu: [
      [25, 50, 100, 500, 1000, -1],
      [25, 50, 100, 500, 1000, "All"]
    ],
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    bProcessing: true,
    aoColumns: allAoColumns,
    aaSorting: [
      [4, 'desc'],
      [5, 'desc'],
      [0, 'desc']
    ],
    sDom: sDom2i1p,
    oTableTools: oTableTools
  });

  fnAddFilterHead('#all-cable', allAoColumns);
  fnAddFilterFoot('#all-cable', allAoColumns);

  $('#all-wrap').click(function (e) {
    fnWrap(allTable);
  });
  $('#all-unwrap').click(function (e) {
    fnUnwrap(allTable);
  });

  $('#reload').click(function (e) {
    allTable.fnReloadAjax();
  });

  $('#bar').click(function (e) {
    barChart(allTable);
  });


  filterEvent();
  selectEvent();
});

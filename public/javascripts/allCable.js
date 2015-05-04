/*global fnAddFilterFoot: false, typeColumns: false, sDom: false, oTableTools: false, filterEvent: false*/
/*global window: false*/
$(function () {
  $(document).ajaxError(function (event, jqxhr) {
    if (jqxhr.status === 401) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Please click <a href="/" target="_blank">home</a>, log in, and then save the changes on this page.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }
  });
  var allTableColumns = {
    from: [14, 15, 16, 17],
    to: [18, 19, 20, 21],
    comments: [24]
  };
  var allAoColumns = [selectColumn, numberColumn, requestNumberColumn, statusColumn, updatedOnColumn, approvedOnColumn, submittedByColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);

  var allTable = $('#all-cable').dataTable({
    sAjaxSource: '/allcables/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    iDisplayLength: 50,
    bLengthChange: false,
    // bProcessing: true,
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    aoColumns: allAoColumns,
    aaSorting: [
      [4, 'desc'],
      [5, 'desc'],
      [1, 'desc']
    ],
    sDom: sDomNoLength,
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
  $('#all-show input:checkbox').change(function (e) {
    fnSetColumnsVis(allTable, allTableColumns[$(this).val()], $(this).prop('checked'));
  });
  $('#all-select-all').click(function (e) {
    fnSelectAll(allTable, 'row-selected', 'select-row', true);
  });
  $('#all-select-none').click(function (e) {
    fnDeselect(allTable, 'row-selected', 'select-row');
  });

  $('#reload').click(function (e) {
    allTable.fnReloadAjax();
  });

  filterEvent();
  selectEvent();
});

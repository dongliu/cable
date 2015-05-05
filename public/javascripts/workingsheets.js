/*global clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, FormData: false */
/*global moment: false, Chart: false, json2List: false*/
/*global selectColumn: false, editLinkColumn: false, detailsLinkColumn: false, rejectedOnColumn: false, updatedOnColumn: false, updatedByColumn: false, submittedOnColumn: false, submittedByColumn: false, numberColumn: false, requestNumberColumn: false, approvedOnColumn:false, approvedByColumn:false, requiredColumn: false, fnAddFilterFoot: false, sDom: false, oTableTools: false, fnSelectAll: false, fnDeselect: false, basicColumns: false, fromColumns: false, toColumns: false, conduitColumn: false, lengthColumn: false, commentsColumn: false, statusColumn: false, fnSetColumnsVis: false, fnGetSelected: false, selectEvent: false, filterEvent: false, fnWrap: false, fnUnwrap: false*/
var workingGlobal = {
  plot: null,
  edit: false
};

function splitTags(s) {
  return s ? s.replace(/^(?:\s*,?)+/, '').replace(/(?:\s*,?)*$/, '').split(/\s*[,;]\s*/) : [];
}

function updateTdFromModal(cableNumber, property, parseType, oldValue, newValue, td, oTable) {
  $('#update').prop('disabled', true);
  var sOldValue = oldValue;
  if (parseType && parseType === 'array') {
    sOldValue = oldValue.join();
  }
  if (sOldValue.trim() == newValue.trim()) {
    $('#modal .modal-body').prepend('<div class="text-error">The new value is the same as the old one!</div>');
  } else {
    var data = {};
    data.action = 'update';
    data.property = property;
    data.oldValue = oldValue;
    if (parseType && parseType === 'array') {
      data.newValue = splitTags(newValue);
    } else {
      data.newValue = newValue;
    }
    var ajax = $.ajax({
      url: '/cables/' + cableNumber + '/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (data) {
        oTable.fnUpdate(data, oTable.fnGetPosition(td)[0]);
        $('#modal .modal-body').html('<div class="text-success">The update succeded!</div>');
      },
      error: function (jqXHR, status, error) {
        $('#modal .modal-body').prepend('<div class="text-error">' + jqXHR.responseText + '</div>');
      }
    });
  }
}

function cableDetails(cableData) {
  delete cableData[0];
  var details = '';
  details += '<div id="cable-details" class="collapse out">';
  details += '<h4>Cable details</h4>';
  details += json2List(cableData);
  details += '</div>';
  return details;
}

function updateTd(td, oTable) {
  var cableData = oTable.fnGetData(td.parentNode);
  var cableNumber = cableData.number;
  var columnDef = procuringAoColumns[oTable.fnGetPosition(td)[2]];
  var property = columnDef.mData;
  var parseType = columnDef.sParseType;
  var title = procuringAoColumns[oTable.fnGetPosition(td)[2]].sTitle;
  var oldValue = oTable.fnGetData(td);
  var renderedValue = oldValue;
  if (parseType && parseType === 'array') {
    renderedValue = oldValue.join();
  }
  $('#modalLabel').html('Update the cable <span class="text-info" style="text-decoration: underline;" data-toggle="collapse" data-target="#cable-details">' + cableNumber + '</span> ?');
  $('#modal .modal-body').empty();
  $('#modal .modal-body').append('<div>Update the value of <b>' + title + ' (' + property + ')' + '</b></div>');
  $('#modal .modal-body').append('<div>From <b>' + renderedValue + '</b></div>');
  $('#modal .modal-body').append('<div>To <input id="new-value" type="text"></div>');
  $('#modal .modal-body').append(cableDetails(cableData));
  $('#modal .modal-footer').html('<button id="update" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
  $('#modal').modal('show');
  $('#update').click(function (e) {
    var newValue = $('#new-value').val();
    updateTdFromModal(cableNumber, property, parseType, oldValue, newValue, td, oTable);
  });
}

function batchAction(oTable, action, obsoletedTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var cables = [];
  var required = [];
  if (selected.length) {
    $('#modalLabel').html(action + ' the following ' + selected.length + ' cables? ');
    $('#modal .modal-body').empty();
    // $('#modal .modal-body').append('<form class="form-horizontal" id="modalform"><div class="control-group"><label class="control-label">Staff name</label><div class="controls"><input id="username" type="text" class="input-small" placeholder="Last, First"></div></div><div class="control-group"><label class="control-label">Date</label><div class="controls"><input id="date" type="text" class="input-small" placeholder="date"></div></div></form>');
    selected.forEach(function (row) {
      var data = oTable.fnGetData(row);
      cables.push(row);
      required.push(data.required);
      $('#modal .modal-body').append('<div class="cable" id="' + data.number + '">' + data.number + '||' + formatCableStatus(data.status) + '||' + moment(data.approvedOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.submittedBy + '||' + data.basic.project + '</div>');
    });
    $('#modal .modal-footer').html('<button id="action" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    // $('#username').autocomplete(nameAuto('#username', nameCache));
    // $('#date').datepicker();
    $('#modal').modal('show');
    $('#action').click(function (e) {
      $('#action').prop('disabled', true);
      actionFromModal(cables, action, oTable, obsoletedTable);
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

function actionFromModal(cables, action, activeTable, obsoletedTable) {
  // $('#action').prop('disabled', true);
  var number = $('#modal .modal-body .cable').length;
  $('#modal .modal-body .cable').each(function (index) {
    var that = this;
    $.ajax({
      url: '/cables/' + that.id + '/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: action
      }),
      dataType: 'json'
    }).done(function (cable) {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
      fnSetDeselect(cables[index], 'row-selected', 'select-row');
      switch (action) {
      case 'obsolete':
        activeTable.fnDeleteRow(cables[index]);
        obsoletedTable.fnAddData(cable);
        break;
      default:
        // do nothing
      }
    }).fail(function (jqXHR, status, error) {
      $(that).prepend('<i class="icon-question"></i>');
      $(that).append(' : ' + jqXHR.responseText);
      $(that).addClass('text-error');
    }).always();
  });
}

function query(o, s) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, ''); // strip a leading dot
  var a = s.split('.');
  var i, n;
  for (i = 0; i < a.length; i += 1) {
    if (o.hasOwnProperty(a[i])) {
      o = o[a[i]];
    } else {
      return;
    }
  }
  return o;
}

function drawChart(ctx, selected, oTable, groupBy) {
  var barChartData = {
    labels: [],
    datasets: [{
      fillColor: 'rgba(151,187,205,0.5)',
      strokeColor: 'rgba(151,187,205,0.8)',
      highlightFill: 'rgba(151,187,205,0.75)',
      highlightStroke: 'rgba(151,187,205,1)',
      data: []
    }]
  };
  var data = [];
  if (selected.length) {
    selected.forEach(function (row) {
      data.push(oTable.fnGetData(row));
    });
  } else {
    data = oTable.fnGetData();
  }
  var groups = _.countBy(data, function (item) {
    return query(item, groupBy);
  });
  _.forEach(groups, function (count, key) {
    barChartData.labels.push(key);
    barChartData.datasets[0].data.push(count);
  });
  ctx.clearRect(0, 0, 400, 600);
  if (workingGlobal.plot !== null) {
    workingGlobal.plot.destroy();
  }
  workingGlobal.plot = new Chart(ctx).Bar(barChartData, {
    barShowStroke: false,
    animation: false
  });
}

function barChart(oTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  if (selected.length) {
    $('#modalLabel').html('Plot a bar chart for the selected ' + selected.length + ' items in current table');
  } else {
    $('#modalLabel').html('Plot a bar chart for all items in the table');
  }
  $('#modal .modal-body').empty();
  $('#modal .modal-body').html('<canvas id="barChart" height="400" width="600"></canvas>');
  $('#modal .modal-footer').html('<form class="form-inline"><select id="bar-key"><option value="basic.wbs">WBS</option><option value="basic.traySection">Tray section</option><option value="basic.cableType">Cable type</option><option value="basic.engineer">Engineer</option><option value="conduit">Conduit</option></select> <button id="plot" class="btn btn-primary">Plot</button> <button data-dismiss="modal" aria-hidden="true" class="btn">Close</button></form>');
  $('#modal').modal('show');
  $('#plot').click(function (e) {
    e.preventDefault();
    var ctx = $('#barChart')[0].getContext('2d');
    var groupBy = $('#bar-key').val();
    drawChart(ctx, selected, oTable, groupBy);
  });
}
$(function () {
  $(document).ajaxError(function (event, jqxhr) {
    if (jqxhr.status === 401) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Please click <a href="/" target="_blank">home</a>, log in, and then save the changes on this page.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }
  });
  // var approvingTable, rejectedTable, approvedTable, procuringTable, installingTable, installedTable, obsoletedTable;
  /*approving table starts*/
  var activeAoCulumns = [selectColumn, numberColumn, requestNumberColumn, statusColumn, updatedOnLongColumn, approvedOnLongColumn, submittedByColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  var activeTable = $('#active-table').dataTable({
    sAjaxSource: '/activecables/json',
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
    aoColumns: activeAoCulumns,
    aaSorting: [
      [4, 'desc'],
      [5, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom2iT1l,
    oTableTools: oTableTools
  });
  fnAddFilterHead('#active-table', activeAoCulumns);
  fnAddFilterFoot('#active-table', activeAoCulumns);
  $('#active-wrap').click(function (e) {
    $('#active-table td').removeClass('nowrap');
    activeTable.fnAdjustColumnSizing();
  });
  $('#active-unwrap').click(function (e) {
    $('#active-table td').addClass('nowrap');
    activeTable.fnAdjustColumnSizing();
  });
  $('#active-select-none').click(function (e) {
    fnDeselect(activeTable, 'row-selected', 'select-row');
  });
  $('#active-select-all').click(function (e) {
    fnSelectAll(activeTable, 'row-selected', 'select-row', true);
  });
  $('#obsolte').click(function (e) {
    batchAction(activeTable, 'obsolete', obsoletedTable);
  });
  /*approving tab ends*/
  /*obsoleted tab starts*/
  var obsoletedAoColumns = [selectColumn, numberColumn, requestNumberColumn, statusColumn, obsoletedOnColumn, obsoletedByColumn, submittedByColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  var obsoletedTable = $('#obsoleted-table').dataTable({
    sAjaxSource: '/cables/statuses/5/json',
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
    aoColumns: obsoletedAoColumns,
    aaSorting: [
      [4, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom2iT1l,
    oTableTools: oTableTools
  });
  fnAddFilterHead('#obsoleted-table', obsoletedAoColumns);
  fnAddFilterFoot('#obsoleted-table', obsoletedAoColumns);
  $('#obsoleted-wrap').click(function (e) {
    fnWrap(obsoletedTable);
  });
  $('#obsoleted-unwrap').click(function (e) {
    fnUnwrap(obsoletedTable);
  });
  $('#obsoleted-show input:checkbox').change(function (e) {
    fnSetColumnsVis(obsoletedTable, obsoletedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  /*obsoleted tab end*/
  /*all tabs*/
  filterEvent();
  selectEvent();
  $('#reload').click(function (e) {
    activeTable.fnReloadAjax();
    obsoletedTable.fnReloadAjax();
  });
  $('#bar').click(function (e) {
    var activeTable = $('#tabs .tab-pane.active table').dataTable();
    barChart(activeTable);
  });
});

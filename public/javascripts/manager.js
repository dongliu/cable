/*global clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, FormData: false */
/*global moment: false, Chart: false, json2List: false*/
/*global selectColumn: false, editLinkColumn: false, detailsLinkColumn: false, rejectedOnColumn: false, updatedOnColumn: false, updatedByColumn: false, submittedOnColumn: false, submittedByColumn: false, numberColumn: false, requestNumberColumn: false, approvedOnColumn:false, approvedByColumn:false, requiredColumn: false, fnAddFilterFoot: false, sDom: false, oTableTools: false, fnSelectAll: false, fnDeselect: false, basicColumns: false, fromColumns: false, toColumns: false, conduitColumn: false, lengthColumn: false, commentsColumn: false, statusColumn: false, fnSetColumnsVis: false, fnGetSelected: false, selectEvent: false, filterEvent: false, fnWrap: false, fnUnwrap: false*/



var approvingTableColumns = {
  from: [12, 13, 14, 15],
  to: [16, 17, 18, 19],
  comments: [22]
};

/*var rejectedTableColumns = {
  from: [12, 13, 14, 15],
  to: [16, 17, 18, 19],
  comments: [21]
};

var approvedTableColumns = rejectedTableColumns;*/

var procuringTableColumns = {
  from: [15, 16, 17, 18],
  to: [19, 20, 21, 22],
  comments: [25]
};

var procuringAoColumns;

var installingTableColumns = {
  from: [13, 14, 15, 16],
  to: [17, 18, 19, 20],
  comments: [23]
};

var installedTableColumns = {
  from: [12, 13, 14, 15],
  to: [16, 17, 18, 19],
  comments: [22]
};

var managerGlobal = {
  plot: null,
  procuring_edit: false
};

// var nameCache = {};

/*function initCableTableFromData(oTable, data, cb) {
  oTable.fnClearTable();
  oTable.fnAddData(data);
  if ($('#cables-unwrap').hasClass('active')) {
    fnUnwrap(oTable);
  }
  oTable.fnDraw();
  if (cb) {
    cb();
  }
}*/

/*function initRequestTable(oTable, url) {
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json'
  }).done(function (json) {
    oTable.fnClearTable();
    oTable.fnAddData(json);
    oTable.fnDraw();
  }).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
}*/


/*function initCableTables(procuringTable, installingTable, installedTable) {
  if (procuringTable) {
    $.ajax({
      url: '/cables/statuses/1/json',
      type: 'GET',
      dataType: 'json'
    }).done(function (cables) {
      initCableTableFromData(procuringTable, cables, function () {
        $('#procuring-show input:checkbox').each(function (i) {
          fnSetColumnsVis(procuringTable, procuringTableColumns[$(this).val()], $(this).prop('checked'));
        });
      });
    }).fail(function (jqXHR, status, error) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cables.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }).always();
  }

  if (installingTable) {
    $.ajax({
      url: '/cables/statuses/2/json',
      type: 'GET',
      dataType: 'json'
    }).done(function (cables) {
      initCableTableFromData(installingTable, cables, function () {
        $('#installing-show input:checkbox').each(function (i) {
          fnSetColumnsVis(installingTable, installingTableColumns[$(this).val()], $(this).prop('checked'));
        });
      });
    }).fail(function (jqXHR, status, error) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cables.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }).always();
  }

  if (installedTable) {
    $.ajax({
      url: '/cables/statuses/3/json',
      type: 'GET',
      dataType: 'json'
    }).done(function (cables) {
      initCableTableFromData(installedTable, cables, function () {
        $('#installed-show input:checkbox').each(function (i) {
          fnSetColumnsVis(installedTable, installedTableColumns[$(this).val()], $(this).prop('checked'));
        });
      });
    }).fail(function (jqXHR, status, error) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cables.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }).always();
  }
}*/


function approveFromModal(requests, approvingTable, approvedTable, procuringTable) {
  $('#approve').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function (index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id + '/',
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        action: 'approve'
      })
    }).done(function (result) {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
      // remove the request row
      approvingTable.fnDeleteRow(requests[index]);
      // add the requests to the approved table
      approvedTable.fnAddData(result.request);
      // add the new cables to the procuring table
      procuringTable.fnAddData(result.cables);
    }).fail(function (jqXHR, status, error) {
      $(that).prepend('<i class="icon-question"></i>');
      $(that).append(' : ' + jqXHR.responseText);
      $(that).addClass('text-error');
    });
  });
}

function updateTdFromModal(cableNumber, property, oldValue, newValue, td) {
  $('#update').prop('disabled', true);
  if (oldValue == newValue) {
    $('#modal .modal-body').prepend('<div class="text-error">The new value is the same as the old one!</div>');
  } else {
    var data = {};
    data.property = property;
    data.newValue = newValue;
    data.oldValue = oldValue;
    var ajax = $.ajax({
      url: '/cables/' + cableNumber + '/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: function (data) {

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
  var property = procuringAoColumns[oTable.fnGetPosition(td)[2]].mData;
  var title = procuringAoColumns[oTable.fnGetPosition(td)[2]].sTitle;
  var oldValue = oTable.fnGetData(td);
  $('#modalLabel').html('Update the cable <span class="text-info" style="text-decoration: underline;" data-toggle="collapse" data-target="#cable-details">' + cableNumber + '</span> ?');
  $('#modal .modal-body').empty();
  $('#modal .modal-body').append('<div>Update the value of <b>' + title + ' (' + target + ')' + '</b></div>');
  $('#modal .modal-body').append('<div>From <b>' + oldValue + '</b></div>');
  $('#modal .modal-body').append('<div>To <input id="new-value" type="text"></div>');
  $('#modal .modal-body').append(cableDetails(cableData));
  $('#modal .modal-footer').html('<button id="update" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
  $('#modal').modal('show');
  $('#update').click(function (e) {
    var newValue = $('#new-value').val();
    updateTdFromModal(cableNumber, property, oldValue, newValue, td);
  });
}

function batchApprove(oTable, approvedTable, procuringTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var requests = [];
  if (selected.length) {
    $('#modalLabel').html('Approve the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function (row) {
      var data = oTable.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.originCategory + data.basic.originSubcategory + data.basic.signalClassification + '||' + data.basic.wbs + '</div>');
      requests.push(row);
    });
    $('#modal .modal-footer').html('<button id="approve" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#approve').click(function (e) {
      approveFromModal(requests, oTable, approvedTable, procuringTable);
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}


function rejectFromModal(requests, approvingTable, rejectedTable) {
  $('#reject').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function (index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id + '/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'reject'
      }),
      dataType: 'json'
    }).done(function (request) {
      $(that).prepend('<i class="icon-remove"></i>');
      $(that).addClass('text-success');
      // remove the request row
      approvingTable.fnDeleteRow(requests[index]);
      // add the new cables to the procuring table
      rejectedTable.fnAddData(request);
    }).fail(function (jqXHR, status, error) {
      $(that).prepend('<i class="icon-question"></i>');
      $(that).append(' : ' + jqXHR.responseText);
      $(that).addClass('text-error');
    });
  });
}

function batchReject(oTable, rejectedTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var requests = [];
  if (selected.length) {
    $('#modalLabel').html('Reject the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function (row) {
      var data = oTable.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.originCategory + data.basic.originSubcategory + data.basic.signalClassification + '||' + data.basic.wbs + '</div>');
      requests.push(row);
    });
    $('#modal .modal-footer').html('<button id="reject" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#reject').click(function (e) {
      rejectFromModal(requests, oTable, rejectedTable);
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

/*function batchCableAction(oTable, action, procuringTable, installingTable, installedTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var cables = [];
  var required = [];
  if (selected.length) {
    $('#modalLabel').html(action + ' the following ' + selected.length + ' cables? ');
    $('#modal .modal-body').empty();
    $('#modal .modal-body').append('<form class="form-horizontal" id="modalform"><div class="control-group"><label class="control-label">Staff name</label><div class="controls"><input id="username" type="text" class="input-small" placeholder="Last, First"></div></div><div class="control-group"><label class="control-label">Date</label><div class="controls"><input id="date" type="text" class="input-small" placeholder="date"></div></div></form>');
    selected.forEach(function (row) {
      var data = oTable.fnGetData(row);
      cables.push(row);
      required.push(data.required);
      $('#modal .modal-body').append('<div class="cable" id="' + data.number + '">' + data.number + '||' + formatCableStatus(data.status) + '||' + moment(data.approvedOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.submittedBy + '||' + data.basic.project + '</div>');
    });
    $('#modal .modal-footer').html('<button id="action" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#username').autocomplete(nameAuto('#username', nameCache));
    $('#date').datepicker();
    $('#modal').modal('show');
    $('#action').click(function (e) {
      actionFromModal(cables, required, action, procuringTable, installingTable, installedTable);
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

function actionFromModal(cables, required, action, procuringTable, installingTable, installedTable) {
  $('#action').prop('disabled', true);
  var number = $('#modal .modal-body .cable').length;
  $('#modal .modal-body .cable').each(function (index) {
    var that = this;
    $.ajax({
      url: '/cables/' + that.id + '/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: action,
        required: required[index],
        name: $('#username').val(),
        date: $('#date').val()
      }),
      dataType: 'json'
    }).done(function (cable) {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
      fnSetDeselect(cables[index], 'row-selected', 'select-row');
      switch (action) {
      case 'order':
        procuringTable.fnUpdate(cable, cables[index]);
        break;
      case 'receive':
        procuringTable.fnUpdate(cable, cables[index]);
        break;
      case 'accept':
        procuringTable.fnUpdate(cable, cables[index]);
        break;
      case 'install':
        procuringTable.fnDeleteRow(cables[index]);
        installingTable.fnAddData(cable);
        break;
      case 'label':
        installingTable.fnUpdate(cable, cables[index]);
        break;
      case 'benchTerm':
        installingTable.fnUpdate(cable, cables[index]);
        break;
      case 'benchTest':
        installingTable.fnUpdate(cable, cables[index]);
        break;
      case 'pull':
        installingTable.fnUpdate(cable, cables[index]);
        break;
      case 'pulled':
        installingTable.fnUpdate(cable, cables[index]);
        break;
      case 'fieldTerm':
        installingTable.fnUpdate(cable, cables[index]);
        break;
      case 'fieldTest':
        installingTable.fnUpdate(cable, cables[index]);
        break;
      case 'use':
        installingTable.fnDeleteRow(cables[index]);
        installedTable.fnAddData(cable);
        break;
      default:
        // do nothing
      }
    })
      .fail(function (jqXHR, status, error) {
        $(that).prepend('<i class="icon-question"></i>');
        $(that).append(' : ' + jqXHR.responseText);
        $(that).addClass('text-error');
      })
      .always();
  });
}*/

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
  if (managerGlobal.plot !== null) {
    managerGlobal.plot.destroy();
  }
  managerGlobal.plot = new Chart(ctx).Bar(barChartData, {
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
  // $.ajaxSetup({
  //   cache: false
  // });
  $(document).ajaxError(function (event, jqxhr) {
    if (jqxhr.status === 401) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Please click <a href="/" target="_blank">home</a>, log in, and then save the changes on this page.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }
  });

  var approvingTable, rejectedTable, approvedTable, procuringTable, installingTable, installedTable;
  /*approving table starts*/
  var approvingAoCulumns = [selectColumn, editLinkColumn, submittedOnColumn, submittedByColumn].concat(basicColumns, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#approving-table', approvingAoCulumns);
  approvingTable = $('#approving-table').dataTable({
    sAjaxSource: '/requests/statuses/1/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    bProcessing: true,
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    bDeferRender: true,
    aoColumns: approvingAoCulumns,
    aaSorting: [
      [2, 'desc'],
      [5, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#approving-wrap').click(function (e) {
    $('#approving-table td').removeClass('nowrap');
    approvingTable.fnAdjustColumnSizing();
  });

  $('#approving-unwrap').click(function (e) {
    $('#approving-table td').addClass('nowrap');
    approvingTable.fnAdjustColumnSizing();
  });

  $('#approving-show input:checkbox').change(function (e) {
    fnSetColumnsVis(approvingTable, approvingTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#approving-select-none').click(function (e) {
    fnDeselect(approvingTable, 'row-selected', 'select-row');
  });

  $('#approving-select-all').click(function (e) {
    fnSelectAll(approvingTable, 'row-selected', 'select-row', true);
  });

  $('#approving-approve').click(function (e) {
    batchApprove(approvingTable, approvedTable, procuringTable);
  });

  $('#approving-reject').click(function (e) {
    batchReject(approvingTable, rejectedTable);
  });

  /*approving tab ends*/

  /*rejected tab starts*/

  var rejectedAoColumns = [detailsLinkColumn, rejectedOnColumn, submittedOnColumn, submittedByColumn].concat(basicColumns, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#rejected-table', rejectedAoColumns);
  rejectedTable = $('#rejected-table').dataTable({
    aaData: [],
    sAjaxSource: '/requests/statuses/3/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    bProcessing: true,
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    bDeferRender: true,
    aoColumns: rejectedAoColumns,
    aaSorting: [
      [1, 'desc'],
      [2, 'desc'],
      [3, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#rejected-wrap').click(function (e) {
    $('#rejected-table td').removeClass('nowrap');
    rejectedTable.fnAdjustColumnSizing();
  });

  $('#rejected-unwrap').click(function (e) {
    $('#rejected-table td').addClass('nowrap');
    rejectedTable.fnAdjustColumnSizing();
  });

  // $('#rejected-show input:checkbox').change(function (e) {
  //   fnSetColumnsVis(rejectedTable, rejectedTableColumns[$(this).val()], $(this).prop('checked'));
  // });

  /*rejected tab ends*/

  /*approved tab starts*/

  var approvedAoColumns = [detailsLinkColumn, approvedOnColumn, submittedOnColumn, submittedByColumn].concat(basicColumns, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#approved-table', approvedAoColumns);
  approvedTable = $('#approved-table').dataTable({
    sAjaxSource: '/requests/statuses/2/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    bProcessing: true,
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    bDeferRender: true,
    aoColumns: approvedAoColumns,
    aaSorting: [
      [1, 'desc'],
      [2, 'desc'],
      [3, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });


  $('#approved-wrap').click(function (e) {
    $('#approved-table td').removeClass('nowrap');
    approvedTable.fnAdjustColumnSizing();
  });

  $('#approved-unwrap').click(function (e) {
    $('#approved-table td').addClass('nowrap');
    approvedTable.fnAdjustColumnSizing();
  });

  // $('#approved-show input:checkbox').change(function (e) {
  //   fnSetColumnsVis(approvedTable, approvedTableColumns[$(this).val()], $(this).prop('checked'));
  // });

  /*approved tab ends*/

  /*procuring tab starts*/

  procuringAoColumns = [selectColumn, numberColumn, requestNumberColumn, statusColumn, updatedOnColumn, approvedOnColumn, approvedByColumn, submittedByColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#procuring-table', procuringAoColumns);
  procuringTable = $('#procuring-table').dataTable({
    sAjaxSource: '/cables/statuses/1/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    bProcessing: true,
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    aoColumns: procuringAoColumns,
    aaSorting: [
      [5, 'desc'],
      [4, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#procuring-wrap').click(function (e) {
    fnWrap(procuringTable);
  });

  $('#procuring-unwrap').click(function (e) {
    fnUnwrap(procuringTable);
  });

  $('#procuring-show input:checkbox').change(function (e) {
    fnSetColumnsVis(procuringTable, procuringTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#procuring-select-all').click(function (e) {
    fnSelectAll(procuringTable, 'row-selected', 'select-row', true);
  });

  $('#procuring-select-none').click(function (e) {
    fnDeselect(procuringTable, 'row-selected', 'select-row');
  });

  $('#procuring-edit').click(function (e) {
    if (managerGlobal.procuring_edit) {
      // $('#procuring-edit span').text('Edit mode')
      $('#procuring-edit').html('<i class="fa fa-check-square-o fa-lg"></i>&nbsp;Edit mode');
      managerGlobal.procuring_edit = false;
      $('#procuring-order, #procuring-receive, #procuring-accept, #procuring-to-install').prop('disabled', false);
    } else {
      // $('#procuring-edit span').text('View mode')
      $('#procuring-edit').html('<i class="fa fa-edit fa-lg"></i>&nbsp;Check mode');
      managerGlobal.procuring_edit = true;
      $('#procuring-order, #procuring-receive, #procuring-accept, #procuring-to-install').prop('disabled', true);
    }
  });

  $('#procuring-table').on('click', 'td.editable', function (e) {
    e.preventDefault();
    if (managerGlobal.procuring_edit) {
      updateTd(this, procuringTable);
    }
  });
  /*  $('#procuring-order, #procuring-receive, #procuring-accept').click(function (e) {
      batchCableAction(procuringTable, $(this).val(), procuringTable);
    });

    $('#procuring-to-install').click(function (e) {
      batchCableAction(procuringTable, $(this).val(), procuringTable, installingTable);
    });*/

  /*procuring tab ends*/

  /*installing tab starts*/
  var installingAoColumns = [selectColumn, numberColumn, statusColumn, updatedOnColumn, submittedByColumn, requiredColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#installing-table', installingAoColumns);
  installingTable = $('#installing-table').dataTable({
    sAjaxSource: '/cables/statuses/2/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    bProcessing: true,
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    aoColumns: installingAoColumns,
    aaSorting: [
      [3, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#installing-wrap').click(function (e) {
    fnWrap(installingTable);
  });

  $('#installing-unwrap').click(function (e) {
    fnUnwrap(installingTable);
  });

  $('#installing-show input:checkbox').change(function (e) {
    fnSetColumnsVis(installingTable, installingTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#installing-select-all').click(function (e) {
    fnSelectAll(installingTable, 'row-selected', 'select-row', true);
  });

  $('#installing-select-none').click(function (e) {
    fnDeselect(installingTable, 'row-selected', 'select-row');
  });

  /*  $('#installing-label, #installing-benchTerm, #installing-benchTest, #installing-to-pull, #installing-pull, #installing-fieldTerm, #installing-fieldTest').click(function (e) {
      batchCableAction(installingTable, $(this).val(), null, installingTable);
    });

    $('#installing-to-use').click(function (e) {
      batchCableAction(installingTable, $(this).val(), null, installingTable, installedTable);
    });*/

  /*installing tab ends*/

  /*installed tab starts*/
  var installedAoColumns = [selectColumn, numberColumn, statusColumn, updatedOnColumn, submittedByColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#installed-table', installedAoColumns);
  installedTable = $('#installed-table').dataTable({
    sAjaxSource: '/cables/statuses/3/json',
    sAjaxDataProp: '',
    bAutoWidth: false,
    bProcessing: true,
    oLanguage: {
      sLoadingRecords: 'Please wait - loading data from the server ...'
    },
    aoColumns: installedAoColumns,
    aaSorting: [
      [3, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#installed-wrap').click(function (e) {
    fnWrap(installedTable);
  });

  $('#installed-unwrap').click(function (e) {
    fnUnwrap(installedTable);
  });

  $('#installed-show input:checkbox').change(function (e) {
    fnSetColumnsVis(installedTable, installedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#installed-select-all').click(function (e) {
    fnSelectAll(installedTable, 'row-selected', 'select-row', true);
  });

  $('#installed-select-none').click(function (e) {
    fnDeselect(installedTable, 'row-selected', 'select-row');
  });


  /*all tabs*/
  filterEvent();
  selectEvent();

  $('#reload').click(function (e) {
    approvingTable.fnReloadAjax();
    rejectedTable.fnReloadAjax();
    approvedTable.fnReloadAjax();
    procuringTable.fnReloadAjax();
    installingTable.fnReloadAjax();
    installedTable.fnReloadAjax();

    // initRequestTable(approvingTable, '/requests/statuses/1/json');
    // initRequestTable(rejectedTable, 'requests/statuses/3/json');
    // initRequestTable(approvedTable, 'requests/statuses/2/json');
    // initCableTables(procuringTable, installingTable, installedTable);
  });

  $('#bar').click(function (e) {
    var activeTable = $('#tabs .tab-pane.active table').dataTable();
    barChart(activeTable);
  });
});

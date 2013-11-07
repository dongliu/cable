var approvingTableColumns = {
  from: [14, 15, 16, 17, 18, 19, 20, 21],
  to: [22, 23, 24, 25, 26, 27, 28, 29],
  comments: [30]
};

var procuringTableColumns = {
  from: [11, 12, 13, 14, 15, 16, 17, 18],
  to: [19, 20, 21, 22, 23, 24, 25, 26],
  comments: [27]
};

var installingTableColumns = {
  from: [12, 13, 14, 15, 16, 17, 18, 19],
  to: [20, 21, 22, 23, 24, 25, 26, 27],
  comments: [28]
};

var installedTableColumns = procuringTableColumns;

var nameCache = {};

$(document).ajaxError(function(event, jqxhr) {
  if (jqxhr.status == 401) {
    document.location.href = window.location.pathname;
  }
});

$(function() {
  $('#reload').click(function(e) {
    initRequestTable(approvingTable, '/requests/statuses/1/json');
    initRequestTable(rejectedTable, 'requests/statuses/3/json');
    initCableTables(procuringTable, installingTable, installedTable);
  });

  /*approving table starts*/

  var approvingAoCulumns = [selectColumn, editLinkColumn, submittedOnColumn, submittedByColumn, updatedOnColumn, requiredColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#approving-table', approvingAoCulumns);
  var approvingTable = $('#approving-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: approvingAoCulumns,
    aaSorting: [
      [2, 'desc'],
      [4, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  initRequestTable(approvingTable, '/requests/statuses/1/json');
  $('#approving-wrap').click(function(e) {
    $('#approving-table td').removeClass('nowrap');
    approvingTable.fnAdjustColumnSizing();
  });

  $('#approving-unwrap').click(function(e) {
    $('#approving-table td').addClass('nowrap');
    approvingTable.fnAdjustColumnSizing();
  });

  $('#approving-show input:checkbox').change(function(e) {
    fnSetColumnsVis(approvingTable, approvingTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#approving-select-none').click(function(e) {
    fnDeselect(approvingTable, 'row-selected', 'select-row');
  });

  $('#approving-select-all').click(function(e) {
    fnSelectAll(approvingTable, 'row-selected', 'select-row', true);
  });

  $('#approving-approve').click(function(e) {
    batchApprove(approvingTable, procuringTable);
  });

  $('#approving-reject').click(function(e) {
    batchReject(approvingTable, rejectedTable);
  });

  /*approving tab ends*/

  /*rejected tab starts*/

  var rejectedAoColumns = [detailsLinkColumn, rejectedOnColumn, submittedOnColumn, submittedByColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#rejected-table', rejectedAoColumns);
  var rejectedTable = $('#rejected-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: rejectedAoColumns,
    aaSorting: [
      [1, 'desc'],
      [2, 'desc'],
      [3, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  initRequestTable(rejectedTable, 'requests/statuses/3/json');

  $('#rejected-wrap').click(function(e) {
    $('#rejected-table td').removeClass('nowrap');
    rejectedTable.fnAdjustColumnSizing();
  });

  $('#rejected-unwrap').click(function(e) {
    $('#rejected-table td').addClass('nowrap');
    rejectedTable.fnAdjustColumnSizing();
  });

  // $('#rejected-show input:checkbox').change(function(e) {
  //   fnSetColumnsVis(rejectedTable, rejectedTableColumns[$(this).val()], $(this).prop('checked'));
  // });

  /*rejected tab ends*/

  /*procuring tab starts*/

  var procuringAoColumns = [selectColumn, numberColumn, statusColumn, updatedOnColumn, submittedByColumn].concat(basicColumns.slice(0, 1), basicColumns.slice(2, 7), fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#procuring-table', procuringAoColumns);
  var procuringTable = $('#procuring-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: procuringAoColumns,
    aaSorting: [
      [3, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#procuring-wrap').click(function(e) {
    fnWrap(procuringTable);
  });

  $('#procuring-unwrap').click(function(e) {
    fnUnwrap(procuringTable);
  });

  $('#procuring-show input:checkbox').change(function(e) {
    fnSetColumnsVis(procuringTable, procuringTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#procuring-select-all').click(function(e) {
    fnSelectAll(procuringTable, 'row-selected', 'select-row', true);
  });

  $('#procuring-select-none').click(function(e) {
    fnDeselect(procuringTable, 'row-selected', 'select-row');
  });

  $('#procuring-order, #procuring-receive, #procuring-accept').click(function(e) {
    batchCableAction(procuringTable, $(this).val(), procuringTable);
  });

  $('#procuring-to-install').click(function(e) {
    batchCableAction(procuringTable, $(this).val(), procuringTable, installingTable);
  });

  /*procuring tab ends*/

  /*installing tab starts*/
  var installingAoColumns = [selectColumn, numberColumn, statusColumn, updatedOnColumn, submittedByColumn, requiredColumn].concat(basicColumns.slice(0, 1), basicColumns.slice(2, 7), fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#installing-table', installingAoColumns);
  var installingTable = $('#installing-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: installingAoColumns,
    aaSorting: [
      [3, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#installing-wrap').click(function(e) {
    fnWrap(installingTable);
  });

  $('#installing-unwrap').click(function(e) {
    fnUnwrap(installingTable);
  });

  $('#installing-show input:checkbox').change(function(e) {
    fnSetColumnsVis(installingTable, installingTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#installing-select-all').click(function(e) {
    fnSelectAll(installingTable, 'row-selected', 'select-row', true);
  });

  $('#installing-select-none').click(function(e) {
    fnDeselect(installingTable, 'row-selected', 'select-row');
  });

  $('#installing-label, #installing-benchTerm, #installing-benchTest, #installing-to-pull, #installing-pull, #installing-fieldTerm, #installing-fieldTest').click(function(e) {
    batchCableAction(installingTable, $(this).val(), null, installingTable);
  });

  $('#installing-to-use').click(function(e) {
    batchCableAction(installingTable, $(this).val(), null, installingTable, installedTable);
  });

  /*installing tab ends*/

  /*installed tab starts*/
  var installedAoColumns = [selectColumn, numberColumn, statusColumn, updatedOnColumn, submittedByColumn].concat(basicColumns.slice(0, 1), basicColumns.slice(2, 7), fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#installed-table', installedAoColumns);
  var installedTable = $('#installed-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: installedAoColumns,
    aaSorting: [
      [3, 'desc'],
      [1, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#installed-wrap').click(function(e) {
    fnWrap(installedTable);
  });

  $('#installed-unwrap').click(function(e) {
    fnUnwrap(installedTable);
  });

  $('#installed-show input:checkbox').change(function(e) {
    fnSetColumnsVis(installedTable, installedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#installed-select-all').click(function(e) {
    fnSelectAll(installedTable, 'row-selected', 'select-row', true);
  });

  $('#installed-select-none').click(function(e) {
    fnDeselect(installedTable, 'row-selected', 'select-row');
  });


  /*all tabs*/

  addEvents();
  initCableTables(procuringTable, installingTable, installedTable);
});


function initRequestTable(oTable, url) {
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    oTable.fnClearTable();
    oTable.fnAddData(json);
    oTable.fnDraw();
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
}


function initCableTables(procuringTable, installingTable, installedTable) {
  if (procuringTable) {
    $.ajax({
      url: '/cables/statuses/1/json',
      type: 'GET',
      dataType: 'json'
    }).done(function(cables) {
      initCableTableFromData(procuringTable, cables, function() {
        $('#procuring-show input:checkbox').each(function(i) {
          fnSetColumnsVis(procuringTable, procuringTableColumns[$(this).val()], $(this).prop('checked'));
        });
      });
    }).fail(function(jqXHR, status, error) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cables.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }).always();
  }

  if (installingTable) {
    $.ajax({
      url: '/cables/statuses/2/json',
      type: 'GET',
      dataType: 'json'
    }).done(function(cables) {
      initCableTableFromData(installingTable, cables, function() {
        $('#installing-show input:checkbox').each(function(i) {
          fnSetColumnsVis(installingTable, installingTableColumns[$(this).val()], $(this).prop('checked'));
        });
      });
    }).fail(function(jqXHR, status, error) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cables.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }).always();
  }

  if (installedTable) {
    $.ajax({
      url: '/cables/statuses/3/json',
      type: 'GET',
      dataType: 'json'
    }).done(function(cables) {
      initCableTableFromData(installedTable, cables, function() {
        $('#installed-show input:checkbox').each(function(i) {
          fnSetColumnsVis(installedTable, installedTableColumns[$(this).val()], $(this).prop('checked'));
        });
      });
    }).fail(function(jqXHR, status, error) {
      $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cables.</div>');
      $(window).scrollTop($('#message div:last-child').offset().top - 40);
    }).always();
  }
}

function initCableTableFromData(oTable, data, cb) {
  oTable.fnClearTable();
  oTable.fnAddData(data);
  if ($('#cables-unwrap').hasClass('active')) {
    fnUnwrap(oTable);
  }
  oTable.fnDraw();
  if (cb) {
    cb();
  }
}

// function initCableTable(oTable, url, cb) {
//   $.ajax({
//     url: url,
//     type: 'GET',
//     contentType: 'application/json',
//     dataType: 'json'
//   }).done(function(json) {
//     approved.forEach(function(r) {
//       for (i = 0; i < json.length; i += 1) {
//         if (r._id === json[i].request_id) {

//           (json[i])['basic'] = r.basic;
//           (json[i])['from'] = r.from;
//           (json[i])['to'] = r.to;
//           (json[i])['comments'] = r.comments;
//         }
//       }
//     });

//     oTable.fnClearTable();
//     oTable.fnAddData(json);
//     if ($('#cables-unwrap').hasClass('active')) {
//       fnUnwrap(oTable);
//     }
//     oTable.fnDraw();
//     if (cb) {
//       cb();
//     }
//   }).fail(function(jqXHR, status, error) {
//     $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
//     $(window).scrollTop($('#message div:last-child').offset().top - 40);
//   }).always();
// }


function batchApprove(oTable, procuringTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var requests = [];
  if (selected.length) {
    $('#modalLabel').html('Approve the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function(row) {
      var data = oTable.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
      requests.push(row);
    });
    $('#modal .modal-footer').html('<button id="approve" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#approve').click(function(e) {
      approveFromModal(requests, oTable, procuringTable);
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}



function approveFromModal(requests, approvingTable, procuringTable) {
  $('#approve').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function(index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id,
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify({
        action: 'approve'
      }),
    }).done(function(cables) {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
      // remove the request row
      approvingTable.fnDeleteRow(requests[index]);
      // add the new cables to the procuring table
      procuringTable.fnAddData(cables);
    })
      .fail(function(jqXHR, status, error) {
        $(that).prepend('<i class="icon-question"></i>');
        $(that).append(' : ' + jqXHR.responseText);
        $(that).addClass('text-error');
      })
      .always();
  });
}

function batchReject(oTable, rejectedTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var requests = [];
  if (selected.length) {
    $('#modalLabel').html('Reject the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function(row) {
      var data = oTable.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
      requests.push(row);
    });
    $('#modal .modal-footer').html('<button id="reject" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#reject').click(function(e) {
      rejectFromModal(requests, oTable, rejectedTable);
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
  $('#modal .modal-body div').each(function(index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'reject'
      }),
      dataType: 'json'
    }).done(function(request) {
      $(that).prepend('<i class="icon-remove"></i>');
      $(that).addClass('text-success');
      // remove the request row
      approvingTable.fnDeleteRow(requests[index]);
      // add the new cables to the procuring table
      rejectedTable.fnAddData(request);
    })
      .fail(function(jqXHR, status, error) {
        $(that).prepend('<i class="icon-question"></i>');
        $(that).append(' : ' + jqXHR.responseText);
        $(that).addClass('text-error');
      })
      .always();
  });
}


function batchCableAction(oTable, action, procuringTable, installingTable, installedTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var cables = [];
  var required = [];
  if (selected.length) {
    $('#modalLabel').html(action + ' the following ' + selected.length + ' cables? ');
    $('#modal .modal-body').empty();
    $('#modal .modal-body').append('<form class="form-horizontal" id="modalform"><div class="control-group"><label class="control-label">Staff name</label><div class="controls"><input id="username" type="text" class="input-small" placeholder="Last, First"></div></div><div class="control-group"><label class="control-label">Date</label><div class="controls"><input id="date" type="text" class="input-small" placeholder="date"></div></div></form>');
    selected.forEach(function(row) {
      var data = oTable.fnGetData(row);
      cables.push(row);
      required.push(data.required);
      $('#modal .modal-body').append('<div class="cable" id="' + data.number + '">' + data.number + '||' + formatCableStatus(data.status) + '||' + moment(data.approvedOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.submittedBy + '||' + data.basic.project + '</div>');
    });
    $('#modal .modal-footer').html('<button id="action" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#username').autocomplete(nameAuto('#username', nameCache));
    $('#date').datepicker();
    $('#modal').modal('show');
    $('#action').click(function(e) {
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
  $('#modal .modal-body .cable').each(function(index) {
    var that = this;
    $.ajax({
      url: '/cables/' + that.id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: action,
        required: required[index],
        name: $('#username').val(),
        date: $('#date').val()
      }),
      dataType: 'json'
    }).done(function(cable) {
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
      .fail(function(jqXHR, status, error) {
        $(that).prepend('<i class="icon-question"></i>');
        $(that).append(' : ' + jqXHR.responseText);
        $(that).addClass('text-error');
      })
      .always();
  });
}
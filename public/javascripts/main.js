/*global clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, FormData: false */
/*global moment: false*/
/*global selectColumn: false, editLinkColumn: false, detailsLinkColumn: false, createdOnColumn: false, rejectedOnColumn: false, rejectedByColumn: false, updatedOnColumn: false, updatedByColumn: false, submittedOnColumn: false, submittedByColumn: false, numberColumn: false, approvedOnColumn:false, approvedByColumn: false, requiredColumn: false, fnAddFilterFoot: false, sDom: false, oTableTools: false, fnSelectAll: false, fnDeselect: false, basicColumns: false, fromColumns: false, toColumns: false, conduitColumn: false, lengthColumn: false, commentsColumn: false, statusColumn: false, fnSetColumnsVis: false, fnGetSelected: false, selectEvent: false, filterEvent: false, fnWrap: false, fnUnwrap: false*/


var savedTableColumns = {
  from: [13, 14, 15, 16],
  to: [17, 18, 19, 20],
  comments: [23]
};

var submittedTableColumns = savedTableColumns;

var rejectedTableColumns = {
  from: [14, 15, 16, 17],
  to: [18, 19, 20, 21],
  comments: [24]
};

var approvedTableColumns = rejectedTableColumns;

var cablesTableColumns = {
  from: [10, 11, 12, 13],
  to: [14, 15, 16, 17],
  comments: [20]
};

// var approved = [];

var savedTable, submittedTable, rejectedTable, approvedTable, cablesTable;

function initCable(cablesTable) {
  $.ajax({
    url: '/cables/json',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json'
  }).done(function (json) {
    cablesTable.fnClearTable();
    cablesTable.fnAddData(json);
    if ($('#cables-unwrap').hasClass('active')) {
      fnUnwrap(cablesTable);
    }
    cablesTable.fnDraw();

  }).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  });
}

function initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable) {
  $.ajax({
    url: '/requests/json',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json'
  }).done(function (json) {
    var saved = [];
    var submitted = [];
    var rejected = [];
    var approved = [];

    json.forEach(function (r) {
      if (savedTable) {
        if (r.status === 0) {
          saved.push(r);
          return;
        }
      }
      if (submittedTable) {
        if (r.status === 1) {
          submitted.push(r);
          return;
        }
      }
      if (approvedTable) {
        if (r.status === 2) {
          approved.push(r);
          return;
        }
      }
      if (rejectedTable) {
        if (r.status === 3) {
          rejected.push(r);
          return;
        }
      }
    });

    if (savedTable) {
      $('#saved-show input:checkbox').each(function (i) {
        fnSetColumnsVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
      });
      savedTable.fnClearTable();
      savedTable.fnAddData(saved);

      if ($('#saved-unwrap').hasClass('active')) {
        fnUnwrap(savedTable);
      }
      savedTable.fnDraw();
    }
    if (submittedTable) {
      $('#submitted-show input:checkbox').each(function (i) {
        fnSetColumnsVis(submittedTable, submittedTableColumns[$(this).val()], $(this).prop('checked'));
      });
      submittedTable.fnClearTable();
      submittedTable.fnAddData(submitted);
      if ($('#submitted-unwrap').hasClass('active')) {
        fnUnwrap(submittedTable);
      }
      submittedTable.fnDraw();
    }
    if (rejectedTable) {
      $('#rejected-show input:checkbox').each(function (i) {
        fnSetColumnsVis(rejectedTable, rejectedTableColumns[$(this).val()], $(this).prop('checked'));
      });
      rejectedTable.fnClearTable();
      rejectedTable.fnAddData(rejected);
      if ($('#rejected-unwrap').hasClass('active')) {
        fnUnwrap(rejectedTable);
      }
      rejectedTable.fnDraw();
    }
    if (approvedTable) {
      $('#approved-show input:checkbox').each(function (i) {
        fnSetColumnsVis(approvedTable, approvedTableColumns[$(this).val()], $(this).prop('checked'));
      });
      approvedTable.fnClearTable();
      approvedTable.fnAddData(approved);
      if ($('#approved-unwrap').hasClass('active')) {
        fnUnwrap(approvedTable);
      }
      approvedTable.fnDraw();
    }
    if (cablesTable) {
      initCable(cablesTable);
    }
  }).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
}

function submitFromModal() {
  $('#submit').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function (index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id + '/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'submit'
      })
    }).done(function () {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
    }).fail(function (jqXHR, status, error) {
      $(that).prepend('<i class="icon-question"></i>');
      $(that).append(' : ' + jqXHR.responseText);
      $(that).addClass('text-error');
    }).always(function () {
      number = number - 1;
      if (number === 0) {
        initRequests(savedTable, submittedTable);
      }
    });
  });
}

function batchSubmit(table) {
  var selected = fnGetSelected(table, 'row-selected');
  if (selected.length) {
    $('#modalLabel').html('Submit the following ' + selected.length + ' requests for approval? ');
    $('#modal .modal-body').empty();
    selected.forEach(function (row) {
      var data = table.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.originCategory + data.basic.originSubcategory + data.basic.signalClassification + '||' + data.basic.wbs + '</div>');
    });
    $('#modal .modal-footer').html('<button id="submit" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#submit').click(function (e) {
      submitFromModal();
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

function cloneFromModal(requests) {
  $('#clone').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function (index) {
    var that = this;
    $.ajax({
      url: '/requests/',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'clone',
        request: requests[that.id],
        quantity: parseInt($('input', that).val(), 10)
      })
    }).done(function () {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
    }).fail(function (jqXHR, status, error) {
      $(that).prepend('<i class="icon-question"></i>');
      $(that).append(' : ' + jqXHR.responseText);
      $(that).addClass('text-error');
    }).always(function () {
      number = number - 1;
      if (number === 0) {
        initRequests(savedTable);
      }
    });
  });
}

function batchClone(table) {
  var selected = fnGetSelected(table, 'row-selected');
  var requests = {};
  if (selected.length) {
    $('#modalLabel').html('Clone the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function (row) {
      var data = table.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.originCategory + data.basic.originSubcategory + data.basic.signalClassification + '||' + data.basic.wbs + ' <input type="text" placeholder="quantity" value="1" class="type[number] input-mini" min=1 max=20>' + '</div>');
      requests[data._id] = {
        basic: data.basic,
        from: data.from,
        to: data.to,
        conduit: data.conduit,
        comments: data.comments
      };
    });
    $('#modal .modal-footer').html('<button id="clone" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#clone').click(function (e) {
      cloneFromModal(requests);
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

function revertFromModal() {
  $('#revert').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function (index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id + '/',
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'revert'
      })
    }).done(function () {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
    }).fail(function (jqXHR, status, error) {
      $(that).prepend('<i class="icon-question"></i>');
      $(that).append(' : ' + jqXHR.responseText);
      $(that).addClass('text-error');
    }).always(function () {
      number = number - 1;
      if (number === 0) {
        initRequests(savedTable, submittedTable);
      }
    });
  });
}


function batchRevert(table) {
  var selected = fnGetSelected(table, 'row-selected');
  if (selected.length) {
    $('#modalLabel').html('Revert the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function (row) {
      var data = table.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.originCategory + data.basic.originSubcategory + data.basic.signalClassification + '||' + data.basic.wbs + '</div>');
    });
    $('#modal .modal-footer').html('<button id="revert" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#revert').click(function (e) {
      revertFromModal();
    });
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

function deleteFromModal() {
  $('#delete').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function (index) {
    var that = this;
    $.ajax({
      url: '/requests/' + this.id + '/',
      type: 'Delete'
    }).done(function () {
      $(that).wrap('<del></del>');
      $(that).addClass('text-success');
    }).fail(function (jqXHR, status, error) {
      $(that).append(' : ' + jqXHR.responseText);
      $(that).addClass('text-error');
    }).always(function () {
      number = number - 1;
      if (number === 0) {
        initRequests(savedTable);
      }
    });
  });
}

function batchDelete(table) {
  var selected = fnGetSelected(table, 'row-selected');
  if (selected.length) {
    $('#modalLabel').html('Delete the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function (row) {
      var data = table.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.originCategory + data.basic.originSubcategory + data.basic.signalClassification + '||' + data.basic.wbs + '</div>');
    });
    $('#modal .modal-footer').html('<button id="delete" class="btn btn-primary" onclick="deleteFromModal()">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  } else {
    $('#modalLabel').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
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

  $('#reload').click(function (e) {
    initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);
    // initRequests(savedTable, submittedTable, rejectedTable, approvedTable, null);
  });

  /*saved tab starts*/
  // add footer first
  var savedAoColumns = [selectColumn, editLinkColumn, createdOnColumn, updatedOnColumn].concat(basicColumns, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);

  fnAddFilterFoot('#saved-table', savedAoColumns);
  savedTable = $('#saved-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: savedAoColumns,
    aaSorting: [
      [2, 'desc'],
      [3, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#saved-wrap').click(function (e) {
    fnWrap(savedTable);
  });

  $('#saved-unwrap').click(function (e) {
    fnUnwrap(savedTable);
  });

  $('#saved-show input:checkbox').change(function (e) {
    fnSetColumnsVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#saved-select-all').click(function (e) {
    fnSelectAll(savedTable, 'row-selected', 'select-row', true);
  });

  $('#saved-select-none').click(function (e) {
    fnDeselect(savedTable, 'row-selected', 'select-row');
  });

  $('#saved-delete').click(function (e) {
    batchDelete(savedTable);
  });

  $('#saved-submit').click(function (e) {
    batchSubmit(savedTable);
  });

  $('#saved-clone').click(function (e) {
    batchClone(savedTable);
  });
  /*saved tab ends*/

  /*submitted tab starts*/
  var submittedAoColumns = [selectColumn, detailsLinkColumn, submittedOnColumn, updatedOnColumn].concat(basicColumns, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#submitted-table', submittedAoColumns);

  submittedTable = $('#submitted-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: submittedAoColumns,
    'aaSorting': [
      [2, 'desc'],
      [3, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#submitted-wrap').click(function (e) {
    fnWrap(submittedTable);
  });

  $('#submitted-unwrap').click(function (e) {
    fnUnwrap(submittedTable);
  });

  $('#submitted-clone').click(function (e) {
    batchClone(submittedTable);
  });

  $('#submitted-revert').click(function (e) {
    batchRevert(submittedTable);
  });

  $('#submitted-show input:checkbox').change(function (e) {
    fnSetColumnsVis(submittedTable, submittedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#submitted-select-all').click(function (e) {
    fnSelectAll(submittedTable, 'row-selected', 'select-row', true);
  });

  $('#submitted-select-none').click(function (e) {
    fnDeselect(submittedTable, 'row-selected', 'select-row');
  });

  /*submitted tab ends*/

  /*rejected tab starts*/

  var rejectedAoColumns = [selectColumn, detailsLinkColumn, rejectedOnColumn, submittedOnColumn, rejectedByColumn].concat(basicColumns, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#rejected-table', rejectedAoColumns);
  rejectedTable = $('#rejected-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: rejectedAoColumns,
    aaSorting: [
      [2, 'desc'],
      [3, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#rejected-wrap').click(function (e) {
    fnWrap(rejectedTable);
  });

  $('#rejected-unwrap').click(function (e) {
    fnUnwrap(rejectedTable);
  });

  $('#rejected-show input:checkbox').change(function (e) {
    fnSetColumnsVis(rejectedTable, rejectedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#rejected-select-all').click(function (e) {
    fnSelectAll(rejectedTable, 'row-selected', 'select-row', true);
  });

  $('#rejected-select-none').click(function (e) {
    fnDeselect(rejectedTable, 'row-selected', 'select-row');
  });

  $('#rejected-delete').click(function (e) {
    batchDelete(rejectedTable);
  });

  $('#rejected-clone').click(function (e) {
    batchClone(rejectedTable);
  });

  /*rejected tab ends*/

  /*approved tab starts*/
  var approvedAoColumns = [selectColumn, detailsLinkColumn, approvedOnColumn, approvedByColumn, submittedOnColumn].concat(basicColumns, fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);
  fnAddFilterFoot('#approved-table', approvedAoColumns);
  approvedTable = $('#approved-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: approvedAoColumns,
    aaSorting: [
      [2, 'desc'],
      [3, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#approved-select-all').click(function (e) {
    fnSelectAll(approvedTable, 'row-selected', 'select-row', true);
  });

  $('#approved-select-none').click(function (e) {
    fnDeselect(approvedTable, 'row-selected', 'select-row');
  });

  $('#approved-wrap').click(function (e) {
    fnWrap(approvedTable);
  });

  $('#approved-unwrap').click(function (e) {
    fnUnwrap(approvedTable);
  });

  $('#approved-show input:checkbox').change(function (e) {
    fnSetColumnsVis(approvedTable, approvedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#approved-clone').click(function (e) {
    batchClone(approvedTable);
  });

  /*approved tab ends*/

  /*cables tab starts*/
  var cableAoCulumns = [numberColumn, statusColumn, updatedOnColumn].concat(basicColumns.slice(0, 2), basicColumns.slice(3, 8), fromColumns, toColumns).concat([conduitColumn, lengthColumn, commentsColumn]);

  fnAddFilterFoot('#cables-table', cableAoCulumns);
  cablesTable = $('#cables-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: cableAoCulumns,
    'aaSorting': [
      [2, 'desc'],
      [0, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#cables-wrap').click(function (e) {
    fnWrap(cablesTable);
  });

  $('#cables-unwrap').click(function (e) {
    fnUnwrap(cablesTable);
  });

  $('#cables-show input:checkbox').change(function (e) {
    fnSetColumnsVis(cablesTable, cablesTableColumns[$(this).val()], $(this).prop('checked'));
  });

  /*cables tab ends*/

  initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);

  selectEvent();
  filterEvent();
});

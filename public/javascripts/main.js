var savedTableColumns = {
  from: [12, 13, 14, 15, 16, 17, 18, 19],
  to: [20, 21, 22, 23, 24, 25, 26, 27],
  comments: [28]
};

var submittedTableColumns = {
  from: [12, 13, 14, 15, 16, 17, 18, 19],
  to: [20, 21, 22, 23, 24, 25, 26, 27],
  comments: [28]
};

var rejectedTableColumns = submittedTableColumns;

var approvedTableColumns = submittedTableColumns;

var cablesTableColumns = {
  from: [11, 12, 13, 14, 15, 16, 17, 18],
  to: [19, 20, 21, 22, 23, 24, 25, 26],
  comments: [27]
};

var approved = [];

var savedTable, submittedTable, rejectedTable, approvedTable;

$(function() {

  // $.ajaxSetup({
  //   cache: false
  // });

  $('#reload').click(function(e) {
    initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);
  });

  /*saved tab starts*/
  // add footer first
  var savedAoColumns = [selectColumn, editLinkColumn, createdOnColumn, updatedOnColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);

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

  $('#saved-wrap').click(function(e) {
    fnWrap(savedTable);
  });

  $('#saved-unwrap').click(function(e) {
    fnUnwrap(savedTable);
  });

  $('#saved-show input:checkbox').change(function(e) {
    // fnSetFooterVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
    fnSetColumnsVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#saved-select-all').click(function(e) {
    fnSelectAll(savedTable, 'row-selected', 'select-row', true);
  });

  $('#saved-select-none').click(function(e) {
    fnDeselect(savedTable, 'row-selected', 'select-row');
  });

  $('#saved-delete').click(function(e) {
    batchDelete(savedTable);
  });

  $('#saved-submit').click(function(e) {
    batchSubmit(savedTable);
  });

  $('#saved-clone').click(function(e) {
    batchClone(savedTable);
  });
  /*saved tab ends*/

  /*submitted tab starts*/
  var submittedAoColumns = [selectColumn, detailsLinkColumn, submittedOnColumn, updatedOnColumn, createdOnColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#submitted-table', submittedAoColumns);

  submittedTable = $('#submitted-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: submittedAoColumns,
    'aaSorting': [
      [2, 'desc'],
      [3, 'desc'],
      [4, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#submitted-wrap').click(function(e) {
    fnWrap(submittedTable);
  });

  $('#submitted-unwrap').click(function(e) {
    fnUnwrap(submittedTable);
  });

  $('#submitted-clone').click(function(e) {
    batchClone(submittedTable);
  });

  $('#submitted-show input:checkbox').change(function(e) {
    fnSetColumnsVis(submittedTable, submittedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#submitted-select-none').click(function(e) {
    fnDeselect(submittedTable, 'row-selected', 'select-row');
    submittedTable.fnAdjustColumnSizing();
  });


  /*submitted tab ends*/

  /*rejected tab starts*/

  var rejectedAoColumns = [selectColumn, detailsLinkColumn, rejectedOnColumn, submittedOnColumn, rejectedByColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#rejected-table', rejectedAoColumns);
  rejectedTable = $('#rejected-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: rejectedAoColumns,
    aaSorting: [
      [2, 'desc'],
      [3, 'desc'],
      [4, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#rejected-wrap').click(function(e) {
    fnWrap(rejectedTable);
  });

  $('#rejected-unwrap').click(function(e) {
    fnUnwrap(rejectedTable);
  });

  $('#rejected-show input:checkbox').change(function(e) {
    fnSetColumnsVis(rejectedTable, rejectedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#rejected-select-none').click(function(e) {
    fnDeselect(rejectedTable, 'row-selected', 'select-row');
    rejectedTable.fnAdjustColumnSizing();
  });

  $('#rejected-delete').click(function(e) {
    batchDelete(rejectedTable);
  });

  $('#rejected-clone').click(function(e) {
    batchClone(rejectedTable);
  });

  /*rejected tab ends*/

  /*approved tab starts*/
  var approvedAoColumns = [selectColumn, detailsLinkColumn, approvedOnColumn, submittedOnColumn, approvedByColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);
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

  $('#approved-wrap').click(function(e) {
    fnWrap(approvedTable);
  });

  $('#approved-unwrap').click(function(e) {
    fnUnwrap(approvedTable);
  });

  $('#approved-show input:checkbox').change(function(e) {
    fnSetColumnsVis(applicable, approvedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#approved-clone').click(function(e) {
    batchClone(approvedTable);
  });

  /*approved tab ends*/

  /*cables tab starts*/
  var cableAoCulumns = [numberColumn, statusColumn, approvedOnColumn, updatedOnColumn].concat(basicColumns.slice(0,7), fromColumns, toColumns).concat([commentsColumn]);

  fnAddFilterFoot('#cables-table', cableAoCulumns);
  cablesTable = $('#cables-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: cableAoCulumns,
    'aaSorting': [
      [3, 'desc'],
      [2, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

  $('#cables-wrap').click(function(e) {
    fnWrap(cablesTable);
  });

  $('#cables-unwrap').click(function(e) {
    fnUnwrap(cablesTable);
  });

  $('#cables-show input:checkbox').change(function(e) {
    fnSetColumnsVis(cablesTable, cablesTableColumns[$(this).val()], $(this).prop('checked'));
  });

  /*cables tab ends*/

  initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);

  /*all tabs*/
  addEvents();
});


function initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable) {
  $.ajax({
    url: '/requests/json',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json'
  }).done(function(json) {
    var saved = [];
    var submitted = [];
    var rejected = [];

    approved = [];

    json.forEach(function(r) {
      if (r.status === 0) {
        saved.push(r);
        return;
      }
      if (r.status === 1) {
        submitted.push(r);
        return;
      }
      if (r.status === 2) {
        approved.push(r);
        return;
      }
      if (r.status === 3) {
        rejected.push(r);
        return;
      }
    });

    $('#saved-show input:checkbox').each(function(i) {
      fnSetColumnsVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
    });
    savedTable.fnClearTable();
    savedTable.fnAddData(saved);

    if ($('#saved-unwrap').hasClass('active')) {
      fnUnwrap(savedTable);
    }
    savedTable.fnDraw();

    $('#submitted-show input:checkbox').each(function(i) {
      fnSetColumnsVis(submittedTable, submittedTableColumns[$(this).val()], $(this).prop('checked'));
    });
    submittedTable.fnClearTable();
    submittedTable.fnAddData(submitted);
    if ($('#submitted-unwrap').hasClass('active')) {
      fnUnwrap(submittedTable);
    }
    submittedTable.fnDraw();

    $('#rejected-show input:checkbox').each(function(i) {
      fnSetColumnsVis(rejectedTable, rejectedTableColumns[$(this).val()], $(this).prop('checked'));
    });
    rejectedTable.fnClearTable();
    rejectedTable.fnAddData(rejected);
    if ($('#rejected-unwrap').hasClass('active')) {
      fnUnwrap(rejectedTable);
    }
    rejectedTable.fnDraw();

    $('#approved-show input:checkbox').each(function(i) {
      fnSetColumnsVis(approvedTable, approvedTableColumns[$(this).val()], $(this).prop('checked'));
    });
    approvedTable.fnClearTable();
    approvedTable.fnAddData(approved);
    if ($('#approved-unwrap').hasClass('active')) {
      fnUnwrap(approvedTable);
    }
    approvedTable.fnDraw();

    if (cablesTable) {
      initCable(cablesTable);
    }
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
}

function initCable(cablesTable) {
  $.ajax({
    url: '/cables/json',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json'
  }).done(function(json) {
    approved.forEach(function(r) {
      for (i = 0; i < json.length; i += 1) {
        if (r._id === json[i].request_id) {

          (json[i])['basic'] = r.basic;
          (json[i])['from'] = r.from;
          (json[i])['to'] = r.to;
          (json[i])['comments'] = r.comments;
          // (json[i])['request'] = r;
        }
      }
    });

    cablesTable.fnClearTable();
    cablesTable.fnAddData(json);
    if ($('#cables-unwrap').hasClass('active')) {
      fnUnwrap(cablesTable);
    }
    cablesTable.fnDraw();

  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
}

function deleteFromModal() {
  $('#delete').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function(index) {
    var that = this;
    $.ajax({
      url: '/requests/' + this.id,
      type: 'Delete',
    }).done(function() {
      $(that).wrap('<del></del>');
      $(that).addClass('text-success');
    })
      .fail(function(jqXHR, status, error) {
        $(that).append(' : ' + jqXHR.reponseText);
        $(that).addClass('text-error');
      })
      .always(function() {
        number = number - 1;
        if (number === 0) {
          initRequests(savedTable, submittedTable, rejectedTable, approvedTable);
        }
      });
  });
}


function submitFromModal(requests) {
  $('#submit').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function(index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'submit',
        request: requests[that.id]
      }),
    }).done(function() {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
    })
      .fail(function(jqXHR, status, error) {
        $(that).prepend('<i class="icon-question"></i>');
        $(that).append(' : ' + jqXHR.reponseText);
        $(that).addClass('text-error');
      })
      .always(function() {
        number = number - 1;
        if (number === 0) {
          initRequests(savedTable, submittedTable, rejectedTable, approvedTable);
        }
      });
  });
}

function batchSubmit(table) {
  var selected = fnGetSelected(table, 'row-selected');
  var requests = {};
  if (selected.length) {
    $('#modalLable').html('Submit the following ' + selected.length + ' requests for approval? ');
    $('#modal .modal-body').empty();
    selected.forEach(function(row) {
      var data = table.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
      requests[data._id] = {
        basic: data.basic,
        from: data.from,
        to: data.to,
        comments: data.comments
      };
    });
    $('#modal .modal-footer').html('<button id="submit" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#submit').click(function(e) {
      submitFromModal(requests);
    });
  } else {
    $('#modalLable').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

function batchClone(table) {
  var selected = fnGetSelected(table, 'row-selected');
  var requests = {};
  if (selected.length) {
    $('#modalLable').html('Clone the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function(row) {
      var data = table.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + ' <input type="text" placeholder="quantity" value="1" class="type[number] input-mini" min=1>' + '</div>');
      requests[data._id] = {
        basic: data.basic,
        from: data.from,
        to: data.to,
        comments: data.comments
      };
    });
    // $('#modal .modal-body').html('test');
    $('#modal .modal-footer').html('<button id="clone" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#clone').click(function(e) {
      cloneFromModal(requests);
    });
  } else {
    $('#modalLable').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}


function cloneFromModal(requests) {
  $('#clone').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function(index) {
    var that = this;
    $.ajax({
      url: '/requests/',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'clone',
        request: requests[that.id],
        quantity: parseInt($('input', that).val(), 10)
      }),
    }).done(function() {
      $(that).prepend('<i class="icon-check"></i>');
      $(that).addClass('text-success');
    })
      .fail(function(jqXHR, status, error) {
        $(that).prepend('<i class="icon-question"></i>');
        $(that).append(' : ' + jqXHR.reponseText);
        $(that).addClass('text-error');
      })
      .always(function() {
        number = number - 1;
        if (number === 0) {
          initRequests(savedTable, submittedTable, rejectedTable, approvedTable);
        }
      });
  });
}


function batchDelete(table) {
  var selected = fnGetSelected(table, 'row-selected');
  if (selected.length) {
    $('#modalLable').html('Delete the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function(row) {
      var data = table.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
    });
    $('#modal .modal-footer').html('<button id="delete" class="btn btn-primary" onclick="deleteFromModal()">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  } else {
    $('#modalLable').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}


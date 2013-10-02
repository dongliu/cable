var approvingTableColumns = {
  from: [13, 14, 15, 16, 17, 18, 19, 20],
  to: [21, 22, 23, 24, 25, 26, 27, 28],
  comments: [29]
};

var rejectedTableColumns = approvingTableColumns;

$(function() {
  /*approving table starts*/

  var approvingAoCulumns = [selectColumn, editLinkColumn, submittedOnColumn, updatedOnColumn, submittedByColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#approving-table', approvingAoCulumns);
  var approvingTable = $('#approving-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: approvingAoCulumns,
    aaSorting: [
      [2, 'desc'],
      [3, 'desc'],
      [4, 'desc']
    ],
    sDom: sDom,
    oTableTools: oTableTools
  });

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
    batchApprove(approvingTable);
  });

  $('#approving-reject').click(function(e) {
    batchReject(approvingTable);
  });


  initRequestTable(approvingTable, '/requests/statuses/1/json');

  /*approving tab ends*/

  /*rejected tab starts*/

  var rejectedAoColumns = [detailsLinkColumn, rejectedOnColumn, submittedOnColumn, submittedByColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]);
  fnAddFilterFoot('#rejected-table', rejectedAoColumns);
  var rejectedTable = $('#rejected-table').dataTable({
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


  var procuring = [];
  var procuringTable = $('#procuring-table').dataTable({
    'aaData': procuring,
    'aoColumns': [{
        'sTitle': 'Number'
      }, {
        'sTitle': 'Submitted by'
      },
      // {
      //   'sTitle': 'Submitted on'
      // },
      {
        'sTitle': 'Approved by'
      }, {
        'sTitle': 'Approved on'
      }
    ],
    'aaSorting': [
      [4, 'desc']
    ],
    "sDom": "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "oTableTools": {
      "sSwfPath": "datatables/swf/copy_csv_xls_pdf.swf",
      "aButtons": [
        "copy",
        "print", {
          "sExtends": "collection",
          "sButtonText": 'Save <span class="caret" />',
          "aButtons": ["csv", "xls", "pdf"]
        }
      ]
    }
  });
  $.ajax({
    url: '/cables/statuses/0/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    procuring = json.map(function(cable) {
      return [].concat(cable.number).concat(cable.submittedBy).concat(moment(cable.submittedOn).format('YYYY-MM-DD HH:mm:ss')).concat(cable.approvedBy).concat(moment(cable.approvedOn).format('YYYY-MM-DD HH:mm:ss'));
    });
    procuringTable.fnClearTable();
    procuringTable.fnAddData(procuring);
    procuringTable.fnDraw();
    $('tbody tr', $('#procuring-table')).click(function(e) {
      var id = procuringTable.fnGetData(this, 0);
      window.open('/cables/' + id);
    });
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();

  /*all tabs*/
  addEvents();

});


function initRequestTable(table, url) {
  $.ajax({
    url: url,
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    table.fnClearTable();
    table.fnAddData(json);
    table.fnDraw();
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
}

// function

function batchApprove(oTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var requests = {};
  if (selected.length) {
    $('#modalLable').html('Approve the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function(row) {
      var data = oTable.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
      requests[data._id] = {
        basic: data.basic,
        from: data.from,
        to: data.to,
        comments: data.comments
      };
    });
    $('#modal .modal-footer').html('<button id="approve" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#approve').click(function(e) {
      approveFromModal(requests, oTable);
    });
  } else {
    $('#modalLable').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}



function approveFromModal(requests, approvingTable) {
  $('#approve').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function(index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'approve',
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
          initRequestTable(approvingTable, '/requests/statuses/1/json');
        }
      });
  });
}

function batchReject(oTable) {
  var selected = fnGetSelected(oTable, 'row-selected');
  var requests = {};
  if (selected.length) {
    $('#modalLable').html('Reject the following ' + selected.length + ' requests? ');
    $('#modal .modal-body').empty();
    selected.forEach(function(row) {
      var data = oTable.fnGetData(row);
      $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
      requests[data._id] = {
        basic: data.basic,
        from: data.from,
        to: data.to,
        comments: data.comments
      };
    });
    // $('#modal .modal-body').html('test');
    $('#modal .modal-footer').html('<button id="reject" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
    $('#reject').click(function(e) {
      rejectFromModal(requests, oTable);
    });
  } else {
    $('#modalLable').html('Alert');
    $('#modal .modal-body').html('No request has been selected!');
    $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
    $('#modal').modal('show');
  }
}

function rejectFromModal(requests, approvingTable) {
  $('#reject').prop('disabled', true);
  var number = $('#modal .modal-body div').length;
  $('#modal .modal-body div').each(function(index) {
    var that = this;
    $.ajax({
      url: '/requests/' + that.id,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({
        action: 'reject',
        request: requests[that.id]
      }),
    }).done(function() {
      $(that).prepend('<i class="icon-remove"></i>');
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
          initRequestTable(approvingTable, '/requests/statuses/1/json');
          initRequestTable(rejectedTable, 'requests/statuses/3/json');
        }
      });
  });
}
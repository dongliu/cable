var approvingTableColumns = {
  from: [12, 13, 14, 15, 16, 17, 18, 19],
  to: [20, 21, 22, 23, 24, 25, 26, 27],
  comments: [28]
};

var rejectedTableColumns = approvingTableColumns;

$(function() {
  /*approving table starts*/
  var approvingTable = $('#approving-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: [{
      sTitle: '',
      sDefaultContent: '<label class="checkbox"><input type="checkbox" class="select-row"></label>',
      sSortDataType: 'dom-checkbox',
      asSorting: ['desc', 'asc']
    }, {
      sTitle: '',
      mData: '_id',
      mRender: function(data, type, full) {
        return '<a href="requests/' + data + '" target="_blank"><i class="icon-file-text icon-large"></i></a>';
      },
      bSortable: false
    }, {
      sTitle: 'Submitted on',
      mData: 'submittedOn',
      mRender: function(data, type, full) {
        return formatDate(data);
      }
    }, {
      sTitle: 'Updated on',
      sDefaultContent: '',
      mData: 'updatedOn',
      mRender: function(data, type, full) {
        return formatDate(data);
      }
    }, {
      sTitle: 'Submitted by',
      mData: 'submittedBy',
      mRender: function(data, type, full) {
        return '<a href = "/users/' + data + '" target="_blank">' + data + '</a>';
      }
    }, {
      sTitle: 'project',
      sDefaultContent: '',
      mData: 'basic.project'
    }, {
      sTitle: 'SSS',
      sDefaultContent: '',
      mData: function(source, type, val) {
        return (source.basic.system ? source.basic.system : '?') + (source.basic.subsystem ? source.basic.subsystem : '?') + (source.basic.signal ? source.basic.signal : '?');
      }
    }, {
      sTitle: 'Cable type',
      sDefaultContent: '',
      mData: 'basic.cableType'
    }, {
      sTitle: 'Engineer',
      sDefaultContent: '',
      mData: 'basic.engineer'
    }, {
      sTitle: 'Service',
      sDefaultContent: '',
      mData: 'basic.service'
    }, {
      sTitle: 'WBS',
      sDefaultContent: '',
      mData: 'basic.wbs'
    }, {
      sTitle: 'Quantity',
      sDefaultContent: '',
      mData: 'basic.quantity'
    }, {
      sTitle: 'From building',
      sDefaultContent: '',
      mData: 'from.building'
    }, {
      sTitle: 'room',
      sDefaultContent: '',
      mData: 'from.room'
    }, {
      sTitle: 'elevation',
      sDefaultContent: '',
      mData: 'from.elevation'
    }, {
      sTitle: 'unit',
      sDefaultContent: '',
      mData: 'from.unit'
    }, {
      sTitle: 'term. device',
      sDefaultContent: '',
      mData: 'from.terminationDevice'
    }, {
      sTitle: 'term. type',
      sDefaultContent: '',
      mData: 'from.terminationType'
    }, {
      sTitle: 'wiring drawing',
      sDefaultContent: '',
      mData: 'from.wiringDrawing'
    }, {
      sTitle: 'lebel',
      sDefaultContent: '',
      mData: 'from.label'
    }, {
      sTitle: 'To building',
      sDefaultContent: '',
      mData: 'to.building'
    }, {
      sTitle: 'room',
      sDefaultContent: '',
      mData: 'to.room'
    }, {
      sTitle: 'elevation',
      sDefaultContent: '',
      mData: 'to.elevation'
    }, {
      sTitle: 'unit',
      sDefaultContent: '',
      mData: 'to.unit'
    }, {
      sTitle: 'term. device',
      sDefaultContent: '',
      mData: 'to.terminationDevice'
    }, {
      sTitle: 'term. type',
      sDefaultContent: '',
      mData: 'to.terminationType'
    }, {
      sTitle: 'wiring drawing',
      sDefaultContent: '',
      mData: 'to.wiringDrawing'
    }, {
      sTitle: 'lebel',
      sDefaultContent: '',
      mData: 'to.label'
    }, {
      sTitle: 'Comments',
      sDefaultContent: '',
      mData: 'comments'
    }],
    'aaSorting': [
      [2, 'desc'],
      [3, 'desc'],
      [4, 'desc']
    ],
    "sDom": "<'row-fluid'<'span6'<'control-group'T>>><'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
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
    approvingTable.fnAdjustColumnSizing();
  });

  $('#approving-approve').click(function(e) {
    var selected = fnGetSelected(approvingTable, 'row-selected');
    var requests = {};
    if (selected.length) {
      $('#modalLable').html('Approve the following ' + selected.length + ' requests? ');
      $('#modal .modal-body').empty();
      selected.forEach(function(row) {
        var data = approvingTable.fnGetData(row);
        $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
        requests[data._id] = {
          basic: data.basic,
          from: data.from,
          to: data.to,
          comments: data.comments
        };
      });
      // $('#modal .modal-body').html('test');
      $('#modal .modal-footer').html('<button id="approve" class="btn btn-primary">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
      $('#modal').modal('show');
      $('#approve').click(function(e) {
        approveFromModal(requests, approvingTable);
      });
    } else {
      $('#modalLable').html('Alert');
      $('#modal .modal-body').html('No request has been selected!');
      $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
      $('#modal').modal('show');
    }
  });

  $('#approving-reject').click(function(e) {
    var selected = fnGetSelected(approvingTable, 'row-selected');
    var requests = {};
    if (selected.length) {
      $('#modalLable').html('Reject the following ' + selected.length + ' requests? ');
      $('#modal .modal-body').empty();
      selected.forEach(function(row) {
        var data = approvingTable.fnGetData(row);
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
        rejectFromModal(requests, approvingTable);
      });
    } else {
      $('#modalLable').html('Alert');
      $('#modal .modal-body').html('No request has been selected!');
      $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
      $('#modal').modal('show');
    }
  });


  initRequestTable(approvingTable, '/requests/statuses/1/json');

  /*approving tab ends*/

  /*rejected tab starts*/

  var rejectedTable = $('#rejected-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: [{
      sTitle: '',
      sDefaultContent: '<label class="checkbox"><input type="checkbox" class="select-row"></label>',
      sSortDataType: 'dom-checkbox',
      asSorting: ['desc', 'asc']
    }, {
      sTitle: '',
      mData: '_id',
      mRender: function(data, type, full) {
        return '<a href="requests/' + data + '" target="_blank"><i class="icon-file-text icon-large"></i></a>';
      },
      bSortable: false
    }, {
      sTitle: 'Rejected on',
      mData: 'rejectedOn',
      mRender: function(data, type, full) {
        return formatDate(data);
      }
    }, {
      sTitle: 'Submitted on',
      mData: 'submittedOn',
      mRender: function(data, type, full) {
        return formatDate(data);
      }
    }, {
      sTitle: 'Submitted by',
      mData: 'submittedBy',
      mRender: function(data, type, full) {
        return '<a href = "/users/' + data + '" target="_blank">' + data + '</a>';
      }
    }, {
      sTitle: 'project',
      sDefaultContent: '',
      mData: 'basic.project'
    }, {
      sTitle: 'SSS',
      sDefaultContent: '',
      mData: function(source, type, val) {
        return (source.basic.system ? source.basic.system : '?') + (source.basic.subsystem ? source.basic.subsystem : '?') + (source.basic.signal ? source.basic.signal : '?');
      }
    }, {
      sTitle: 'Cable type',
      sDefaultContent: '',
      mData: 'basic.cableType'
    }, {
      sTitle: 'Engineer',
      sDefaultContent: '',
      mData: 'basic.engineer'
    }, {
      sTitle: 'Service',
      sDefaultContent: '',
      mData: 'basic.service'
    }, {
      sTitle: 'WBS',
      sDefaultContent: '',
      mData: 'basic.wbs'
    }, {
      sTitle: 'Quantity',
      sDefaultContent: '',
      mData: 'basic.quantity'
    }, {
      sTitle: 'From building',
      sDefaultContent: '',
      mData: 'from.building'
    }, {
      sTitle: 'room',
      sDefaultContent: '',
      mData: 'from.room'
    }, {
      sTitle: 'elevation',
      sDefaultContent: '',
      mData: 'from.elevation'
    }, {
      sTitle: 'unit',
      sDefaultContent: '',
      mData: 'from.unit'
    }, {
      sTitle: 'term. device',
      sDefaultContent: '',
      mData: 'from.terminationDevice'
    }, {
      sTitle: 'term. type',
      sDefaultContent: '',
      mData: 'from.terminationType'
    }, {
      sTitle: 'wiring drawing',
      sDefaultContent: '',
      mData: 'from.wiringDrawing'
    }, {
      sTitle: 'lebel',
      sDefaultContent: '',
      mData: 'from.label'
    }, {
      sTitle: 'To building',
      sDefaultContent: '',
      mData: 'to.building'
    }, {
      sTitle: 'room',
      sDefaultContent: '',
      mData: 'to.room'
    }, {
      sTitle: 'elevation',
      sDefaultContent: '',
      mData: 'to.elevation'
    }, {
      sTitle: 'unit',
      sDefaultContent: '',
      mData: 'to.unit'
    }, {
      sTitle: 'term. device',
      sDefaultContent: '',
      mData: 'to.terminationDevice'
    }, {
      sTitle: 'term. type',
      sDefaultContent: '',
      mData: 'to.terminationType'
    }, {
      sTitle: 'wiring drawing',
      sDefaultContent: '',
      mData: 'to.wiringDrawing'
    }, {
      sTitle: 'lebel',
      sDefaultContent: '',
      mData: 'to.label'
    }, {
      sTitle: 'Comments',
      sDefaultContent: '',
      mData: 'comments'
    }],
    'aaSorting': [
      [2, 'desc'],
      [3, 'desc'],
      [4, 'desc']
    ],
    "sDom": "<'row-fluid'<'span6'<'control-group'T>>><'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
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
    url: '/requests/statuses/3/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    rejectedTable.fnClearTable();
    rejectedTable.fnAddData(json);
    rejectedTable.fnDraw();
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();

  $('#rejected-wrap').click(function(e) {
    $('#rejected-table td').removeClass('nowrap');
    rejectedTable.fnAdjustColumnSizing();
  });

  $('#rejected-unwrap').click(function(e) {
    $('#rejected-table td').addClass('nowrap');
    rejectedTable.fnAdjustColumnSizing();
  });

  $('#rejected-show input:checkbox').change(function(e) {
    fnSetColumnsVis(rejectedTable, rejectedTableColumns[$(this).val()], $(this).prop('checked'));
  });


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
  $('tbody').on('click', 'input.select-row', function(e) {
    if ($(this).prop('checked')) {
      $(e.target).closest('tr').addClass('row-selected');
    } else {
      $(e.target).closest('tr').removeClass('row-selected');
    }
  });

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
    // addClick($('#approving-table'), approvingTable, 7);
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
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
        }
      });
  });
}

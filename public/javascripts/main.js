var savedTableColumns = {
  from: [11, 12, 13, 14, 15, 16, 17, 18],
  to: [19, 20, 21, 22, 23, 24, 25, 26],
  comments: [27]
};

var savedTable, submittedTable, rejectedTable, approvedTable;

$(function() {
  // var saved = [];
  savedTable = $('#saved-table').dataTable({
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
      sTitle: 'Created on',
      mData: 'createdOn',
      mRender: function(data, type, full) {
        return formatDate(data);
      }
      // ,asSorting: ['desc']
    }, {
      sTitle: 'Updated on',
      sDefaultContent: '',
      mData: 'updatedOn',
      mRender: function(data, type, full) {
        return formatDate(data);
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
      [2, 'desc']
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
  $('#saved-table tbody').on('click', 'input.select-row', function(e) {
    if ($(this).prop('checked')) {
      $(e.target).closest('tr').addClass('row-selected');
    } else {
      $(e.target).closest('tr').removeClass('row-selected');
    }
  });

  $('#saved-show input:checkbox').change(function(e) {
    fnSetColumnsVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#saved-select-none').click(function(e) {
    fnDeselect(savedTable, 'row-selected', 'select-row');
    savedTable.fnAdjustColumnSizing();
  });

  $('#saved-delete').click(function(e) {
    var selected = fnGetSelected(savedTable, 'row-selected');
    if (selected.length) {
      $('#modalLable').html('Delete the following ' + selected.length + ' requests? ');
      $('#modal .modal-body').empty();
      selected.forEach(function(row) {
        var data = savedTable.fnGetData(row);
        $('#modal .modal-body').append('<div id="' + data._id + '">' + moment(data.createdOn).format('YYYY-MM-DD HH:mm:ss') + '||' + data.basic.system + data.basic.subsystem + data.basic.signal + '||' + data.basic.wbs + '</div>');
      });
      // $('#modal .modal-body').html('test');
      $('#modal .modal-footer').html('<button id="delete" class="btn btn-primary" onclick="deleteFromModal()">Confirm</button><button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
      $('#modal').modal('show');
    } else {
      $('#modalLable').html('Alert');
      $('#modal .modal-body').html('No request has been selected!');
      $('#modal .modal-footer').html('<button data-dismiss="modal" aria-hidden="true" class="btn">Return</button>');
      $('#modal').modal('show');
    }
  });

  var submitted = [];
  submittedTable = $('#submitted-table').dataTable({
    'aaData': submitted,
    'aoColumns': [
      // {
      //   'sTitle': 'Submitted by'
      // },
      {
        'sTitle': 'Submitted on'
      }, {
        'sTitle': 'System'
      }, {
        'sTitle': 'Sub system'
      }, {
        'sTitle': 'Signal'
      }, {
        'sTitle': 'Updated by'
      }, {
        'sTitle': 'Updated on'
      }, {
        'sTitle': 'id',
        "bVisible": false
      }
    ],
    'aaSorting': [
      [1, 'desc']
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


  var rejected = [];
  rejectedTable = $('#rejected-table').dataTable({
    'aaData': rejected,
    'aoColumns': [
      // {
      //   'sTitle': 'Submitted by'
      // },
      {
        'sTitle': 'Submitted on'
      }, {
        'sTitle': 'System'
      }, {
        'sTitle': 'Sub system'
      }, {
        'sTitle': 'Signal'
      }, {
        'sTitle': 'Rejected by'
      }, {
        'sTitle': 'Rejected on'
      }, {
        'sTitle': 'id',
        "bVisible": false
      }
    ],
    'aaSorting': [
      [5, 'desc']
    ],
    "sDom": "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    // 'bAutoWidth': false,
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

  initRequests(savedTable, submittedTable, rejectedTable);

  var approved = [];
  approvedTable = $('#approved-table').dataTable({
    'aaData': approved,
    'aoColumns': [{
      'sTitle': 'Number'
    }, {
      'sTitle': 'Submitted on'
    }, {
      'sTitle': 'Approved by'
    }, {
      'sTitle': 'Approved on'
    }, {
      'sTitle': 'id',
      "bVisible": false
    }],
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
    url: '/cables/json',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json'
  }).done(function(json) {
    var approvedJson = json.filter(function(cable) {
      return (cable.status === 0);
    });


    if (approvedJson.length) {
      approved = approvedJson.map(function(cable) {
        return [].concat(cable.number).concat(cable.submittedBy).concat(moment(cable.submittedOn).format('YYYY-MM-DD HH:mm:ss')).concat(cable.approvedBy).concat(moment(cable.approvedOn).format('YYYY-MM-DD HH:mm:ss'));
      });
      approvedTable.fnClearTable();
      approvedTable.fnAddData(approved);
      approvedTable.fnDraw();
      $('tbody tr', $('#approved-table')).click(function(e) {
        var id = approvedTable.fnGetData(this, 0);
        window.open('/cables/' + id);
      });
    }

  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();



});


// function addClick(div, table, position) {
//   $('tbody tr', div).click(function(e) {
//     var id = table.fnGetData(this, position);
//     window.open('/requests/' + id);
//   });
// }

function formatRequest(requests) {
  for (var i = 0; i < requests.length; i += 1) {
    formatDate(requests[i].createdOn);
    formatDate(requests[i].updatedOn);
    formatDate(requests[i].submittedOn);
    formatDate(requests[i].rejectedOn);
  }
}

function initRequests(savedTable, submittedTable, rejectedTable) {
  $.ajax({
    url: '/requests/json',
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json'
  }).done(function(json) {
    var saved = json.filter(function(request) {
      return (request.status === 0);
    });
    var submittedJson = json.filter(function(request) {
      return (request.status === 1);
    });
    var rejectedJson = json.filter(function(request) {
      return (request.status === 3);
    });

    if (saved.length) {

      $('#saved-show input:checkbox').each(function(i) {
        fnSetColumnsVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
      });
      // saved = savedJson;
      savedTable.fnClearTable();
      savedTable.fnAddData(saved);

      savedTable.fnDraw();
    }

    if (submittedJson.length) {
      submitted = submittedJson.map(function(request) {
        return [].concat(moment(request.submittedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request.basic.system).concat(request.basic.subsystem).concat(request.basic.signal).concat(request.updatedBy || '').concat(request.updatedOn ? moment(request.updatedOn).format('YYYY-MM-DD HH:mm:ss') : '').concat(request._id);
      });
      submittedTable.fnClearTable();
      submittedTable.fnAddData(submitted);
      submittedTable.fnDraw();
      addClick($('#submitted-table'), submittedTable, 6);
    }

    if (rejectedJson.length) {
      rejected = rejectedJson.map(function(request) {
        // return [].concat(request.submittedBy).concat(moment(request.submittedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request.basic.system).concat(request.basic.subsystem).concat(request.basic.signal).concat(request.rejectedBy).concat(moment(request.rejectedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request._id);
        return [].concat(moment(request.submittedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request.basic.system).concat(request.basic.subsystem).concat(request.basic.signal).concat(request.rejectedBy).concat(moment(request.rejectedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request._id);
      });
      rejectedTable.fnClearTable();
      rejectedTable.fnAddData(rejected);
      rejectedTable.fnDraw();
      addClick($('#rejected-table'), rejectedTable, 6);
    }
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
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
      // contentType: 'application/json',
      // dataType: 'json'
    }).done(function() {
      $(that).wrap('<del></del>');
    })
      .fail(function(jqXHR, status, error) {
        $(that).append(' : ' + jqXHR.reponseText);
        // if (jqXHR.statusCode() === 410) {
        //   $('#'+item.id).append(' : ' + jqXHR.reponseText);
        // }
      })
      .always(function() {
        number = number - 1;
        if (number === 0) {
          initRequests(savedTable, submittedTable, rejectedTable);
        }
      });
  });
}
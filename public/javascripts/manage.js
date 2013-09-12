$(function() {
  var approving = [];
  var approvingTable = $('#approving-table').dataTable({
    'aaData': approving,
    'aoColumns': [{
      'sTitle': 'Submitted by'
    }, {
      'sTitle': 'Submitted on'
    }, {
      'sTitle': 'System'
    }, {
      'sTitle': 'Sub system'
    }, {
      'sTitle': 'Signal'
    }, {
      'sTitle': 'Adjusted by'
    }, {
      'sTitle': 'Adjusted on'
    }, {
      'sTitle': 'id',
      "bVisible": false
    }],
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
  $.ajax({
    url: '/requests/statuses/1/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    submitted = json.map(function(request) {
      return [].concat(request.submittedBy).concat(moment(request.submittedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request.basic.system).concat(request.basic.subsystem).concat(request.basic.signal).concat(request.adjustedBy || '').concat(request.adjustedOn ? moment(request.adjustedOn).format('YYYY-MM-DD HH:mm:ss') : '').concat(request._id);
    });
    approvingTable.fnClearTable();
    approvingTable.fnAddData(submitted);
    approvingTable.fnDraw();
    addClick($('#approving-table'), approvingTable, 7);
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();

  var rejected = [];
  var rejectedTable = $('#rejected-table').dataTable({
    'aaData': rejected,
    'aoColumns': [{
      'sTitle': 'Submitted by'
    }, {
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
    }],
    'aaSorting': [
      [6, 'desc']
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
  $.ajax({
    url: '/requests/statuses/4/json',
    type: 'GET',
    dataType: 'json'
  }).done(function(json) {
    rejected = json.map(function(request) {
      return [].concat(request.submittedBy).concat(moment(request.submittedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request.basic.system).concat(request.basic.subsystem).concat(request.basic.signal).concat(request.rejectedBy).concat(moment(request.rejectedOn).format('YYYY-MM-DD HH:mm:ss')).concat(request._id);
    });
    rejectedTable.fnClearTable();
    rejectedTable.fnAddData(rejected);
    rejectedTable.fnDraw();
    addClick($('#rejected-table'), rejectedTable, 7);
  }).fail(function(jqXHR, status, error) {
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable requests.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();


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

});


function addClick(div, table, position) {
  $('tbody tr', div).click(function(e) {
    var id = table.fnGetData(this, position);
    window.open('/requests/' + id);
  });
}
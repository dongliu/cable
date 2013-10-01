var savedTableColumns = {
  from: [11, 12, 13, 14, 15, 16, 17, 18],
  to: [19, 20, 21, 22, 23, 24, 25, 26],
  comments: [27]
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

var selectColumn = {
  sTitle: '',
  sDefaultContent: '<label class="checkbox"><input type="checkbox" class="select-row"></label>',
  sSortDataType: 'dom-checkbox',
  asSorting: ['desc', 'asc']
};

var editLinkColumn = {
  sTitle: '',
  mData: '_id',
  mRender: function(data, type, full) {
    return '<a href="requests/' + data + '" target="_blank"><i class="icon-edit icon-large"></i></a>';
  },
  bSortable: false
};

var createdOnColumn = {
  sTitle: 'Created on',
  mData: 'createdOn',
  mRender: function(data, type, full) {
    return formatDate(data);
  }
};

var updatedOnColumn = {
  sTitle: 'Updated on',
  sDefaultContent: '',
  mData: 'updatedOn',
  mRender: function(data, type, full) {
    return formatDate(data);
  }
};

var commentsColumn = {
  sTitle: 'Comments',
  sDefaultContent: '',
  mData: 'comments'
};

var basicColumns = [{
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
  sTitle: 'Tags',
  sDefaultContent: '',
  mData: function(source, type, val) {
    if (source.basic.tags) {
      return source.basic.tags.join();
    } else {
      return '';
    }
  }
}, {
  sTitle: 'Quantity',
  sDefaultContent: '',
  mData: 'basic.quantity'
}];
var fromColumns = [{
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
  sTitle: 'label',
  sDefaultContent: '',
  mData: 'from.label'
}];

var toColumns = [{
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
  sTitle: 'label',
  sDefaultContent: '',
  mData: 'to.label'
}];

var oTableTools = {
  "sSwfPath": "datatables/swf/copy_csv_xls_pdf.swf",
  "aButtons": [
    "copy",
    "print", {
      "sExtends": "collection",
      "sButtonText": 'Save <span class="caret" />',
      "aButtons": ["csv", "xls", "pdf"]
    }
  ]
};

$(function() {

  // $.ajaxSetup({
  //   cache: false
  // });

  $('#reload').click(function(e) {
    initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);
  });

  /*saved tab starts*/
  savedTable = $('#saved-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    // aoColumns: [{
    //   sTitle: '',
    //   sDefaultContent: '<label class="checkbox"><input type="checkbox" class="select-row"></label>',
    //   sSortDataType: 'dom-checkbox',
    //   asSorting: ['desc', 'asc']
    // }, {
    //   sTitle: '',
    //   mData: '_id',
    //   mRender: function(data, type, full) {
    //     return '<a href="requests/' + data + '" target="_blank"><i class="icon-edit icon-large"></i></a>';
    //   },
    //   bSortable: false
    // }, {
    //   sTitle: 'Created on',
    //   mData: 'createdOn',
    //   mRender: function(data, type, full) {
    //     return formatDate(data);
    //   }
    //   // ,asSorting: ['desc']
    // }, {
    //   sTitle: 'Updated on',
    //   sDefaultContent: '',
    //   mData: 'updatedOn',
    //   mRender: function(data, type, full) {
    //     return formatDate(data);
    //   }
    // }, {
    //   sTitle: 'project',
    //   sDefaultContent: '',
    //   mData: 'basic.project'
    // }, {
    //   sTitle: 'SSS',
    //   sDefaultContent: '',
    //   mData: function(source, type, val) {
    //     return (source.basic.system ? source.basic.system : '?') + (source.basic.subsystem ? source.basic.subsystem : '?') + (source.basic.signal ? source.basic.signal : '?');
    //   }
    // }, {
    //   sTitle: 'Cable type',
    //   sDefaultContent: '',
    //   mData: 'basic.cableType'
    // }, {
    //   sTitle: 'Engineer',
    //   sDefaultContent: '',
    //   mData: 'basic.engineer'
    // }, {
    //   sTitle: 'Service',
    //   sDefaultContent: '',
    //   mData: 'basic.service'
    // }, {
    //   sTitle: 'WBS',
    //   sDefaultContent: '',
    //   mData: 'basic.wbs'
    // }, {
    //   sTitle: 'Tags',
    //   sDefaultContent: '',
    //   mData: function(source, type, val) {
    //     if (source.basic.tags) {
    //       return source.basic.tags.join();
    //     } else {
    //       return '';
    //     }
    //   }
    // }, {
    //   sTitle: 'Quantity',
    //   sDefaultContent: '',
    //   mData: 'basic.quantity'
    // }, {
    //   sTitle: 'From building',
    //   sDefaultContent: '',
    //   mData: 'from.building'
    // }, {
    //   sTitle: 'room',
    //   sDefaultContent: '',
    //   mData: 'from.room'
    // }, {
    //   sTitle: 'elevation',
    //   sDefaultContent: '',
    //   mData: 'from.elevation'
    // }, {
    //   sTitle: 'unit',
    //   sDefaultContent: '',
    //   mData: 'from.unit'
    // }, {
    //   sTitle: 'term. device',
    //   sDefaultContent: '',
    //   mData: 'from.terminationDevice'
    // }, {
    //   sTitle: 'term. type',
    //   sDefaultContent: '',
    //   mData: 'from.terminationType'
    // }, {
    //   sTitle: 'wiring drawing',
    //   sDefaultContent: '',
    //   mData: 'from.wiringDrawing'
    // }, {
    //   sTitle: 'label',
    //   sDefaultContent: '',
    //   mData: 'from.label'
    // }, {
    //   sTitle: 'To building',
    //   sDefaultContent: '',
    //   mData: 'to.building'
    // }, {
    //   sTitle: 'room',
    //   sDefaultContent: '',
    //   mData: 'to.room'
    // }, {
    //   sTitle: 'elevation',
    //   sDefaultContent: '',
    //   mData: 'to.elevation'
    // }, {
    //   sTitle: 'unit',
    //   sDefaultContent: '',
    //   mData: 'to.unit'
    // }, {
    //   sTitle: 'term. device',
    //   sDefaultContent: '',
    //   mData: 'to.terminationDevice'
    // }, {
    //   sTitle: 'term. type',
    //   sDefaultContent: '',
    //   mData: 'to.terminationType'
    // }, {
    //   sTitle: 'wiring drawing',
    //   sDefaultContent: '',
    //   mData: 'to.wiringDrawing'
    // }, {
    //   sTitle: 'label',
    //   sDefaultContent: '',
    //   mData: 'to.label'
    // }, {
    //   sTitle: 'Comments',
    //   sDefaultContent: '',
    //   mData: 'comments'
    // }],
    aoColumns: [selectColumn, editLinkColumn, createdOnColumn, updatedOnColumn].concat(basicColumns, fromColumns, toColumns).concat([commentsColumn]),
    'aaSorting': [
      [2, 'desc'],
      [3, 'desc']
    ],
    "sDom": "<'row-fluid'<'span6'<'control-group'T>>><'row-fluid'<'span6'l><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
    "oTableTools": oTableTools
  });

  $('#saved-wrap').click(function(e) {
    fnWrap(savedTable);
  });

  $('#saved-unwrap').click(function(e) {
    fnUnwrap(savedTable);
  });

  $('#saved-show input:checkbox').change(function(e) {
    fnSetColumnsVis(savedTable, savedTableColumns[$(this).val()], $(this).prop('checked'));
  });

  $('#saved-select-all').click(function(e) {
    fnSelectAll(savedTable, 'row-selected', 'select-row', true);
    // savedTable.fnAdjustColumnSizing();
  });

  $('#saved-select-none').click(function(e) {
    fnDeselect(savedTable, 'row-selected', 'select-row');
    // savedTable.fnAdjustColumnSizing();
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
  submittedTable = $('#submitted-table').dataTable({
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
        return '<a href="requests/' + data + '/details" target="_blank"><i class="icon-file-text-alt icon-large"></i></a>';
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
      sTitle: 'Created on',
      mData: 'createdOn',
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
      sTitle: 'label',
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
      sTitle: 'label',
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
  rejectedTable = $('#rejected-table').dataTable({
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
        return '<a href="requests/' + data + '/details" target="_blank"><i class="icon-file-text-alt icon-large"></i></a>';
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
      sTitle: 'Rejected by',
      mData: 'rejectedBy',
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
      sTitle: 'label',
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
      sTitle: 'label',
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
  approvedTable = $('#approved-table').dataTable({
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
        return '<a href="requests/' + data + '/details" target="_blank"><i class="icon-file-text-alt icon-large"></i></a>';
      },
      bSortable: false
    }, {
      sTitle: 'Approved on',
      mData: 'approvedOn',
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
      sTitle: 'Approved by',
      mData: 'approvedBy',
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
      sTitle: 'label',
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
      sTitle: 'label',
      sDefaultContent: '',
      mData: 'to.label'
    }, {
      sTitle: 'Comments',
      sDefaultContent: '',
      mData: 'comments'
    }],
    'aaSorting': [
      [2, 'desc'],
      [3, 'desc']
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
  cablesTable = $('#cables-table').dataTable({
    aaData: [],
    bAutoWidth: false,
    aoColumns: [{
      sTitle: '',
      sDefaultContent: '<label class="checkbox"><input type="checkbox" class="select-row"></label>',
      sSortDataType: 'dom-checkbox',
      asSorting: ['desc', 'asc']
    }, {
      sTitle: 'Number',
      mData: 'number',
      mRender: function(data, type, full) {
        return '<a href="cables/' + data + '" target="_blank">' + data + '</a>';
      }
    }, {
      sTitle: 'Status',
      mData: 'status',
      mRender: function(data, type, full) {
        return formatCableStatus(data);
      }
    }, {
      sTitle: 'Approved on',
      mData: 'approvedOn',
      mRender: function(data, type, full) {
        return formatDate(data);
      }
    }, {
      sTitle: 'Submitted by',
      mData: 'request.submittedBy',
      mRender: function(data, type, full) {
        return '<a href = "/users/' + data + '" target="_blank">' + data + '</a>';
      }
    }, {
      sTitle: 'project',
      sDefaultContent: '',
      mData: 'request.basic.project'
    }, {
      sTitle: 'Cable type',
      sDefaultContent: '',
      mData: 'request.basic.cableType'
    }, {
      sTitle: 'Engineer',
      sDefaultContent: '',
      mData: 'request.basic.engineer'
    }, {
      sTitle: 'Service',
      sDefaultContent: '',
      mData: 'request.basic.service'
    }, {
      sTitle: 'WBS',
      sDefaultContent: '',
      mData: 'request.basic.wbs'
    }, {
      sTitle: 'Quantity',
      sDefaultContent: '',
      mData: 'request.basic.quantity'
    }, {
      sTitle: 'From building',
      sDefaultContent: '',
      mData: 'request.from.building'
    }, {
      sTitle: 'room',
      sDefaultContent: '',
      mData: 'request.from.room'
    }, {
      sTitle: 'elevation',
      sDefaultContent: '',
      mData: 'request.from.elevation'
    }, {
      sTitle: 'unit',
      sDefaultContent: '',
      mData: 'request.from.unit'
    }, {
      sTitle: 'term. device',
      sDefaultContent: '',
      mData: 'request.from.terminationDevice'
    }, {
      sTitle: 'term. type',
      sDefaultContent: '',
      mData: 'request.from.terminationType'
    }, {
      sTitle: 'wiring drawing',
      sDefaultContent: '',
      mData: 'request.from.wiringDrawing'
    }, {
      sTitle: 'label',
      sDefaultContent: '',
      mData: 'request.from.label'
    }, {
      sTitle: 'To building',
      sDefaultContent: '',
      mData: 'request.to.building'
    }, {
      sTitle: 'room',
      sDefaultContent: '',
      mData: 'request.to.room'
    }, {
      sTitle: 'elevation',
      sDefaultContent: '',
      mData: 'request.to.elevation'
    }, {
      sTitle: 'unit',
      sDefaultContent: '',
      mData: 'request.to.unit'
    }, {
      sTitle: 'term. device',
      sDefaultContent: '',
      mData: 'request.to.terminationDevice'
    }, {
      sTitle: 'term. type',
      sDefaultContent: '',
      mData: 'request.to.terminationType'
    }, {
      sTitle: 'wiring drawing',
      sDefaultContent: '',
      mData: 'request.to.wiringDrawing'
    }, {
      sTitle: 'label',
      sDefaultContent: '',
      mData: 'request.to.label'
    }, {
      sTitle: 'Comments',
      sDefaultContent: '',
      mData: 'request.comments'
    }],
    'aaSorting': [
      [3, 'desc'],
      [1, 'desc']
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
  $('tbody').on('click', 'input.select-row', function(e) {
    if ($(this).prop('checked')) {
      $(e.target).closest('tr').addClass('row-selected');
    } else {
      $(e.target).closest('tr').removeClass('row-selected');
    }
  });
});



function formatRequest(requests) {
  for (var i = 0; i < requests.length; i += 1) {
    formatDate(requests[i].createdOn);
    formatDate(requests[i].updatedOn);
    formatDate(requests[i].submittedOn);
    formatDate(requests[i].rejectedOn);
  }
}

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

    initCable(cablesTable);
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
          (json[i])['request'] = r;
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
          initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);
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
          initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);
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
    // $('#modal .modal-body').html('test');
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
          initRequests(savedTable, submittedTable, rejectedTable, approvedTable, cablesTable);
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

function formatCableStatus(s) {
  var status = ['approved', 'ordered', 'received', 'accepted', 'labeled', 'bench terminated', 'bench tested', 'pulled', 'field terminated', 'tested'];
  if (0 <= s && s <= 9) {
    return status[s];
  }
  return 'unknown';
}
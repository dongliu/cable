function fnGetSelected(oTableLocal, selectedClass) {
  var aReturn = [];
  var aTrs = oTableLocal.fnGetNodes();

  for (var i = 0; i < aTrs.length; i++) {
    if ($(aTrs[i]).hasClass(selectedClass)) {
      aReturn.push(aTrs[i]);
    }
  }
  return aReturn;
}

function fnDeselect(oTableLocal, selectedClass, checkboxClass) {
  var aTrs = oTableLocal.fnGetNodes();

  for (var i = 0; i < aTrs.length; i++) {
    if ($(aTrs[i]).hasClass(selectedClass)) {
      $(aTrs[i]).removeClass(selectedClass);
      $(aTrs[i]).find('input.'+checkboxClass+':checked').prop('checked', false);
    }
  }
}


function fnSetColumnsVis(oTableLocal, columns, show) {
  columns.forEach(function(e, i, a) {
    oTableLocal.fnSetColumnVis(e, show);
  });
}

function formatDate(date) {
  return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
}

$.fn.dataTableExt.afnSortData['dom-checkbox'] = function(oSettings, iColumn) {
  return $.map(oSettings.oApi._fnGetTrNodes(oSettings), function(tr, i) {
    return $('td:eq(' + iColumn + ') input', tr).prop('checked') ? '1' : '0';
  });
};


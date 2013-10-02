function fnWrap(oTableLocal){
  $(oTableLocal.fnSettings().aoData).each(function(){
      $(this.nTr).removeClass('nowrap');
    });
    oTableLocal.fnAdjustColumnSizing();
}

function fnUnwrap(oTableLocal){
  $(oTableLocal.fnSettings().aoData).each(function(){
      $(this.nTr).addClass('nowrap');
    });
    oTableLocal.fnAdjustColumnSizing();
}



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

function fnSelectAll(oTableLocal, selectedClass, checkboxClass, filtered) {
  fnDeselect(oTableLocal, selectedClass, checkboxClass);
  var settings = oTableLocal.fnSettings();
  var indexes = (filtered === true) ? settings.aiDisplay : settings.aiDisplayMaster;
  indexes.forEach(function(i){
    var r = oTableLocal.fnGetNodes(i);
    $(r).addClass(selectedClass);
    $(r).find('input.'+checkboxClass).prop('checked', true);
  });
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

function fnAddFilterFoot(sTable, aoColumns) {
  // var size = $(sTable + ' thead th').length;
  var foot = $(document.createElement('tfoot'));
  foot.append('<tr role="row"></tr>');

  // $(sTable + ' thead th').each(function(index){
    // if (indexes.indexOf(index) !== -1) {
  aoColumns.forEach(function(c){
    if (c.bFilter){
      $('tr', foot).append('<th><input type="text" placeholder="'+c.sTitle+'" class="input-mini" autocomplete="off"></th>');
      // foot.append('<th><input type="text" class="input-mini" autocomplete="off"></th>');
    } else {
      $('tr', foot).append('<th></th>');
    }
  });
  $(sTable).append(foot);
}

function formatDate(date) {
  return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
}

$.fn.dataTableExt.afnSortData['dom-checkbox'] = function(oSettings, iColumn) {
  return $.map(oSettings.oApi._fnGetTrNodes(oSettings), function(tr, i) {
    return $('td:eq(' + iColumn + ') input', tr).prop('checked') ? '1' : '0';
  });
};


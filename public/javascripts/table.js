function fnGetSelected(oTableLocal) {
  var aReturn = new Array();
  var aTrs = oTableLocal.fnGetNodes();

  for (var i = 0; i < aTrs.length; i++) {
    if ($(aTrs[i]).hasClass('row-selected')) {
      aReturn.push(aTrs[i]);
    }
  }
  return aReturn;
}
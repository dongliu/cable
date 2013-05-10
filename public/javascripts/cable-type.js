$(function() {
  var aaData = [];
  var cabletype = $('#cable-type').dataTable({
      'aaData' : aaData,
      'aoColumns': [
        {'sTitle' : 'Name'},
        {'sTitle' : 'Characteristics'},
        {'sTitle' : 'Diameter'},
        {'sTitle' : 'Function/Service'},
        {'sTitle' : 'Voltage'},
        {'sTitle' : 'Insulation'},
        {'sTitle' : 'Jacket'},
        {'sTitle' : 'Raceway'},
        {'sTitle' : 'TID'},
        {'sTitle' : 'Model'},
        {'sTitle' : 'Comments'},
        {'sTitle' : 'Spec'}
      ],
      "sDom": "<'row-fluid'<'span6'T><'span6'f>r>t<'row-fluid'<'span6'i><'span6'p>>",
      "oTableTools": {
        "sSwfPath": "datatables/swf/copy_csv_xls_pdf.swf",
        "aButtons": [
          "copy",
          "print",
          {
            "sExtends":    "collection",
            "sButtonText": 'Save <span class="caret" />',
            "aButtons":    [ "csv", "xls", "pdf" ]
          }
        ]
      }
    });
  $.ajax({
    url: '/cabletype/all',
    type: 'GET',
    dataType: 'json'
  }).done(function(json){
    aaData = json.map(function(type){
      return [].concat(type.name).concat(type.characteristics).concat(type.diameter).concat(type.service).concat(type.voltage).concat(type.insulation).concat(type.jacket).concat(type.raceway).concat(type.tid).concat(type.model).concat(type.comments).concat(type.spec);
    });
    cabletype.fnClearTable();
    cabletype.fnAddData(aaData);
    cabletype.fnDraw();
  }).fail(function(jqXHR, status, error){
    $('#message').append('<div class="alert alert-info"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for user information.</div>');
  }).always();


});
$(function() {
  var cableType = [];
  var nameCache = {};
  var deviceCache = {};
  var rackCache = {};
  sss();

  $('#type-details').popover({
    html: true
  });

  $('#engineer').autocomplete({
    minLength: 1,
    source: function(req, res) {
      var term = req.term.toLowerCase();
      var output = [];
      var key = term.charAt(0);
      if (key in nameCache) {
        for (var i = 0; i < nameCache[key].length; i += 1) {
          if (nameCache[key][i].toLowerCase().indexOf(term) === 0) {
            output.push(nameCache[key][i]);
          }
        }
        res(output);
        return;
      }
      $.getJSON('/username', req, function(data, status, xhr) {
        var names = [];
        for (var i = 0; i < data.length; i += 1) {
          if (data[i].displayName.indexOf(',') !== -1) {
            names.push(data[i].displayName);
          }
        }
        nameCache[term] = names;
        res(names);
      });
    }
  });

  $('#type').autocomplete({
    minLength : 1,
    source: function(req, res) {
      var term = req.term.toLowerCase();
      var output = [];
      if (cableType.length === 0) {
        $.getJSON('/cabletype/all', req, function(data, status, xhr) {
          cableType = data;
          res(getType(cableType, term));
        });
      } else {
        res(getType(cableType, term));
      }
    },
    select: function(event, ui) {
      var type = null;
      for (var i = 0; i < cableType.length; i += 1) {
        if (cableType[i].name == ui.item.value) {
          type = cableType[i];
          break;
        }
      }
      if (type) {
        $('#type-details').attr('disabled', false);
        $('#type-details').attr('data-original-title', type.name);
        $('#type-details').attr('data-content', json2List(type));
      }
    }

  });


});


// function typeDetails() {
//   $('#type-details')
// }


function getType(type, term) {
  var output = [];
  for (var i = 0; i < type.length; i += 1) {
    if (type[i].name.toLowerCase().indexOf(term) !== -1) {
      output.push(type[i].name);
    }
  }
  return output;
}

// system/subsystem/signal
function sss(){
  update('#system', sysSub);
  update('#signal', signal);
  $('#system').change(function(){
    updateSub(sysSub);
    $('#system').next('.add-on').text($('#system option:selected').val());
  });

  $('#sub').change(function(){
    $('#sub').next('.add-on').text($('#sub option:selected').val());
  });

  $('#signal').change(function(){
    $('#signal').next('.add-on').text($('#signal option:selected').val());
  });
}


function updateSub(json){
  var sys = $('#system option:selected').val();
  $('#sub').prop('disabled', false);
  $('#sub option').remove();
  $.each(json[sys]['sub-system'], function(k, v){
    if (v) {
      $('#sub').append($('<option>', {
        value: k
      }).text(v));
    }
  });
}

function update(select, json) {
  $(select).prop('disabled', false);
  $.each(json, function(k, v) {
    if (v) {
      $(select).append($('<option>', {
        value: k
      }).text(v['name']));
    }
  });
}

function json2List(json) {
  var output = '';
  for (var k in json) {
    if (json.hasOwnProperty(k)) {
      if (json[k] && typeof(json[k]) === 'object') {
        output = output + '<dl>' + '<dt>' + '<h4>' + k + '</h4>' + '</dt>' + '<dd>' + json2List(json[k]) + '</dd>' + '</dl>';
      } else {
        if (json[k] == null) {
          output = output + '<b>' + k + '</b>' + ' : ' + '<br/>';
        } else {
          output = output + '<b>' + k + '</b>' + ' : ' + json[k] + '<br/>';
        }
      }
    }
  }
  return output;
}
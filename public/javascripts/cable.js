$(function() {
  var cableType = [];
  var nameCache = {};
  var deviceCache = {};
  var rackCache = {};
  sss();

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
    }
  });


});


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
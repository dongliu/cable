$(function() {
  var cableType = [];
  var nameCache = {};
  var wbs;
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

  $('#wbs').autocomplete({
    minLength : 2,
    source: function(req, res) {
      var term = req.term;
      var output = [];

      if (term.indexOf('.', term.length-1) == -1) {
        // res(output);
        return;
      }

      term = term.substring(0, term.length-1);
      if (wbs && wbs.children) {
        output = getChildren(wbs, term);
        if (output.length == 0) {
          // warning
          // res(output);
          return;
        }
        res(output);
      } else {
        $.getJSON('/wbs/all', req, function(data, status, xhr) {
          wbs = data;
          output = getChildren(wbs, term);
          if (output.length == 0) {
            // warning
            // res(output);
            return;
          }
          res(output);
        });
      }
    },
    select: function(event, ui) {
      var value = ui.item.value;

    }

  });


});


function getChildren(wbs, term) {
  var parts = term.split('.');
  var key = parts[0];
  var locator = findChild(wbs, key);
  // var result;
  if (locator == null) {
     return [];
  }

  for (var i = 1; i < parts.length; i += 1) {
    key = key + '.' + parts[i];
    locator = findChild(locator, key);
    if (locator == null) {
       return [];
    }
  }

  if (locator.children && locator.children.length !== 0) {
    return $.map(locator.children, function(o) {
      return o.number;
    });
  }

  return [];

}

function findChild(object, childNumber) {
  if (object.children) {
    for (var i = 0; i < object.children.length; i += 1) {
      if (object.children[i].number === childNumber) {
        return object.children[i];
      }
    }
  }
  return null;
}


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
        if (json[k] === null) {
          output = output + '<b>' + k + '</b>' + ' : ' + '<br/>';
        } else {
          output = output + '<b>' + k + '</b>' + ' : ' + json[k] + '<br/>';
        }
      }
    }
  }
  return output;
}
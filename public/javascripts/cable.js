var template = {
  request: {
    e: '$.request_id',
    t: function (v) {
      return v[0];
    },
    l: function (v) {
      $('#request').prop('href', '/requests/' + v + '/');
      $('#request').text(v);
    }
  }
};

function jsonETL(json, template) {
  var prop, value;
  for (prop in template) {
    if (template.hasOwnProperty(prop)) {
      value = jsonPath.eval(json, template[prop].e);
      if (template[prop].t && typeof template[prop].t === 'function') {
        value = template[prop].t(value);
      }
      if (template[prop].l) {
        if (typeof template[prop].l === 'string') {
          $(template[prop].l).text(value);
        } else if (typeof template[prop].l === 'function') {
          template[prop].l(value);
        }
      }
    }
  }
}


$(function () {
  $.ajax({
    url: './json',
    type: 'GET',
    dataType: 'json'
  }).done(function (json) {
    jsonETL(json, template);
  }).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable details.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();

  $.ajax({
    url: './changes/json',
    type: 'GET',
    dataType: 'json'
  }).done(function (json) {}).fail(function (jqXHR, status, error) {
    $('#message').append('<div class="alert alert-error"><button class="close" data-dismiss="alert">x</button>Cannot reach the server for cable change history.</div>');
    $(window).scrollTop($('#message div:last-child').offset().top - 40);
  }).always();
});

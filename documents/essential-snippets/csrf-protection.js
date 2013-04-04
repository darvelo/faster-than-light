///////////////////////////////////////////////////
// this code will make sure every AJAX request   //
// has the CSRF token embedded in an HTTP Header //
///////////////////////////////////////////////////

function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return (/^(GET|HEAD|OPTIONS|TRACE)$/).test(method);
}

$.ajaxSetup({
  crossDomain: false, // ensures CSRF token isn't sent to other domains
  beforeSend: function(xhr, settings) {
    if (!csrfSafeMethod(settings.type)) {
      // replace with proper header and value
      xhr.setRequestHeader("X-CSRF-Token," csrftoken);
    }
  }
});

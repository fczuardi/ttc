var  defaults = {}
    ,responseData = {}
defaults.API_URL = 'api.twitter.com'
defaults.LOCAL_TRENDS_PATH = '/1/trends/'

//== getLocalTrends()
this.getLocalTrends = function(woeid, fmt, client, signer, successCallBack, failCallback){
  // current_trends[fmt] = {'as_of': 0, 'body': '', 'remaining_calls': 0, 'trends': []}
  var request
      ,entrypoint = defaults.LOCAL_TRENDS_PATH + woeid + '.' + fmt;
  request = signer ? client.request('GET', entrypoint, null, null, signer)
                  : client.request('GET', entrypoint, {'host': defaults.API_URL});
  request.addListener('response', function(response) {
    var response_type = (response.headers['content-type'].indexOf('xml') != -1) ? 'xml' :
                        ((response.headers['content-type'].indexOf('json') != -1) ? 'json' : 'other')
    response.setEncoding('utf8');
    // error handling
    if (response.statusCode != 200) { 
      failCallback('Request failed.', response);
      return false;
    }
    if (response_type == 'other') { 
      failCallback('Invalid response format.', response);
      return false;
    }
    response.data = response.data?response.data:'';
    response.on('data', function (chunk) { this.data += chunk;});
    response.on('end', successCallBack);
  });
  request.end(); //make the request
}

//== parseTrendsXML()
this.parseTrendsXML = function(xml) {
  var  result = {}
      ,patterns = {
         'created_at': /created_at="([^"]*)"/gim
        ,'as_of': /as_of="([^"]*)"/gim
        // [\d\D]* is what I use for .* with newlines
        ,'location': /<location>[\d\D]*<\/location>/gim
        ,'location_data_woeid': /<woeid[^>]*>([^<]*)<\/woeid>/gim
        ,'location_data_name': /<name[^>]*>([^<]*)<\/name>/gim
        ,'trend': /<trend[^>]*>[^<]*<\/trend>/gim
        ,'trend_data': /<trend\s*query="([^"]*)"\surl="([^"]*)"[^>]*>([^<]*)<\/trend>/i
      }
      ,matches = {
         'created_at': patterns['created_at'].exec(xml)
        ,'as_of': patterns['as_of'].exec(xml)
        ,'location': xml.match(patterns['location'])
        ,'trend': xml.match(patterns['trend'])
      }
  if ((matches.as_of) && (matches.as_of[1])){
      result['as_of'] = matches.as_of[1];
  }
  if ((matches.created_at) && (matches.created_at[1])){
      result['created_at'] = matches.created_at[1];
  }
  if (matches.location) {
    result['locations'] = []
    matches.location.forEach(function(location){
      var location_woeid_matches = patterns.location_data_woeid.exec(location)
      var location_name_matches = patterns.location_data_name.exec(location)
      result['locations'].push({
         'woeid': location_woeid_matches[1]
        ,'name': location_name_matches[1]
      });
    });
  }
  if (matches.trend) {
    result['trends'] = [];
    matches.trend.forEach(function(trend){
      var trend_data_matches = patterns.trend_data.exec(trend);
      result['trends'].push({
         'name': trend_data_matches[3]
        ,'query': trend_data_matches[1]
        ,'url': trend_data_matches[2]
        });
    });
  }
  return result;
}
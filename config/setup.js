//= Default Options
this.options = { 'woeid' : '1'}

//= Constants
this.VERSION = 'v0.1'
this.API_URL = 'api.twitter.com'
this.API_PORT = 80
this.API_PORT_SSL = 443
this.LOCAL_TRENDS_PATH = '/1/trends/'
this.KNOWN_WOEIDS = {
       '1': 'Worldwide'
      ,'23424768': 'Brazil'
      ,'23424977': 'United States'
      ,'23424975': 'United Kingdom'
      ,'23424900': 'Mexico'
      ,'23424803': 'Ireland'
      ,'23424775': 'Canada'
      ,'2358820': 'Baltimore, United States'
      ,'2367105': 'Boston, United States'
      ,'2514815': 'Washington, United States'
      ,'2459115': 'New York, United States'
      ,'2487796': 'San Antonio, United States'
      ,'2379574': 'Chicago, United States'
      ,'2471217': 'Philadelphia, United States'
      ,'2487956': 'San Francisco, United States'
      ,'2442047': 'Los Angeles, United States'
      ,'2424766': 'Houston, United States'
      ,'2357024': 'Atlanta, United States'
      ,'2406080': 'Fort Worth, United States'
      ,'2388929': 'Dallas, United States'
      ,'2490383': 'Seattle, United States'
      ,'455827': 'São Paulo, Brazil'
      ,'44418': 'London, United Kingdom'
    }
this.KNOWN_COUNTRY_CODES = {
       'br': '23424768'
      ,'ca': '23424775'
      ,'gb': '23424975'
      ,'ie': '23424803'
      ,'mx': '23424900'
      ,'us': '23424977'
    }
this.SCRIPT_NAME = 'Trending Topics Client (for Twitter)'
this.SCRIPT_SOURCE_CODE_URL = 'http://github.com/fczuardi/ttc'
this.SCRIPT_TITLE = '\n'+this.SCRIPT_NAME+
                    '\n-------------------------------\n';

var  country_codes = [], woeids = [];
for(code in this.KNOWN_COUNTRY_CODES){
  country_codes.push(code +' - '+this.KNOWN_WOEIDS[this.KNOWN_COUNTRY_CODES[code]]);
}
for(woeid in this.KNOWN_WOEIDS){
  woeids.push(woeid +' - '+this.KNOWN_WOEIDS[woeid]);
}

this.HELP_TEXT = '\
Usage:\
\n\tnode '+ __filename.substring(__dirname.length+1, __filename.length) +' [option value] [option value]…\
\n\
\nOptions:\
\n\t-h/--help:\
\n\t\tPrint this help page and exit.\
\n\
\n\t-l/--location:\
\n\t\tTwo letter country code or the woeid code for the location you want. Default value: '+this.options.woeid+'.\
\n\
\n\t\tThe currently supported country codes are:\n\t\t\t'+ country_codes.join('\n\t\t\t') +'\
\n\
\n\t\tSome known woeid codes:\n\t\t\t'+ woeids.join('\n\t\t\t') +'\
\n\
\n\t\tFor an up-to-date list of locations provided by Twitter, access:\
\n\t\t\tcurl http://api.twitter.com/1/trends/available.xml\
\n\
\n\t-o/--output-file:\
\n\t\tThe path for the output file. Defaults to stdout.\
\n\
\n\t--version:\
\n\t\tPrint the software version and exit.\
\n\
\nAuthor:\
\n\tFabricio Campos Zuardi\
\n\tTwitter: @fczuardi\
\n\tWebsite: http://fabricio.org\
\n\
\nContributions:\
\n\t'+this.SCRIPT_NAME+' is a Free Software released under the MIT License, which\
\n\tmeans that you are welcome to copy, study and modify this software and, why not,\
\n\teven contribute with improvements and bug fixes!\
\n\
\n\tThe code is hosted at '+this.SCRIPT_SOURCE_CODE_URL+'\
\n\
\nThanks for using it! :)\
\n\n';

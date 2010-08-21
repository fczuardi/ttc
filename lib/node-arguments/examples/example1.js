var arguments = require('../index');

arguments.parse([
     {'name': /^(-h|--help)$/, 'expected': null, 'callback': printHelp}
    ,{'name': /^(-b|--beatle)$/, 'expected': /^(george|paul|ringo|john)$/i, 'callback': setupBeatle}
    ,{'name': /^(-v|--volume)$/, 'expected': /^([0-9]|1[0-1])$/, 'callback': setupVolume}
  ], main, invalidArgument);

function printHelp(end){
  console.log('----------\nA pretty help message.');
  end();
}

function setupBeatle(end, beatle){
  console.log('----------\n%s rocks!', beatle);
  end();
}

function setupVolume(end, volume){
  console.log('----------\n%s is a number from 0 to 11', volume);
  end();
}

function main(){
  console.log('----------\nEverything is set.\n\nHello World!\n\n')
}

function invalidArgument(arg, value_missing){
  console.log('----------\nError: the argument %s %s', arg, (value_missing?'expects a value':'is not valid'))
}

/* 
Examples:
node examples/example1.js
node examples/example1.js --help
node examples/example1.js --beatle
node examples/example1.js --beatle bieber
node examples/example1.js --beatle george -v 11
*/

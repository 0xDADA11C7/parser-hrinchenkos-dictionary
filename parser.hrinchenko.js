#!/usr/bin/phantomjs
/*\
 * Parser for Hrinchenko`s dictionary (c) 0xDADA11C7, 2014
\*/
var webpage = require('webpage'), fs = require('fs');
var page = webpage.create();

page.open('http://hrinchenko.com/alfavit.html', function(status) {
    var pages = [];
    var words = [];
    var iPages = 0;
    if (status === 'success') {
        page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
            var links = page.evaluate(function() {
                var l = [];	     
                $('.list_of_letters a').each(function () {
                    l.push('http://hrinchenko.com'+$(this).attr('href'));
                });
                return(l);
	        });
            function asyncLetterPage (arg, callback) {
                var letterPages = [];
                var pageletter = webpage.create();
                pageletter.open(arg, function (status) {   
                    if (status === 'success') {
                        pageletter.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
                            var letterPages = pageletter.evaluate(function() {
                                var l = [];
                                $(".list_pagination a").each( function() {
                                    l.push("http://hrinchenko.com/spisok/bukva/"+$(this).attr('href'));
                                }); 
                                return(l);
                            });
                            pageletter.close();
                            callback(letterPages);
                        });
                    }
                });
            }
            function asyncDictionary (arg, callback) {
                var pagewords = [];
                var pageword = webpage.create();
                pageword.open(arg, function (status) {
                    if (status === 'success') {
                        pageword.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
                            var pagewords = pageword.evaluate(function() {
                                var l = [];
                                $(".list_of_words a").each( function() {
                                    l.push($(this).text());
                                });
                                return(l);
                            });
                            pageword.close();
                            callback(pagewords);
                        });
                    }
                });              
            }
            links.forEach( function (item) {
                asyncLetterPage(item, function(result) {
                    pages = pages.concat(result);
                    iPages++;
                    if (iPages === links.length) {
                        var dictSeries = function (item) {
                            if (item) {
                                asyncDictionary(item, function (result) {
                                    words = words.concat(result);
                                    return (dictSeries(pages.shift()));
                                });
                            } else {
                                console.log('Parsing is complete!\n');
                                fs.write('./hrinchenko.dict.txt', words.join('\n'), 'w');
                                phantom.exit();
                            }
                        }
                        dictSeries(pages.shift());
                    }
                })
            });
        });
    }
});

//setup
var express=require('express');
var app=express();
var http = require('http');
var exphbs = require('express3-handlebars');
var Twitter = require('twitter');
var path = require('path');
var lazy    = require("lazy"),
    fs  = require("fs");
var natural = require('natural'), 
	tokenizer = new natural.WordTokenizer(), 
	classifier = new natural.BayesClassifier();;
var async = require('async');

var client = new Twitter({
  consumer_key: 'WK2Fm9Ha8XlIuI3ZnaeKHxiwL',
  consumer_secret: 'p8LVNWflAe4ECSgcOFI9J7tImscY2jJDrm9Mvs5QTUcTtWH9sM',
  access_token_key: '2583707883-URic8peitepzwq6koPDT2RcSCXtOwDTTeU7OH8q',
  access_token_secret: 'zDXWUbCtR2aKgHHJ3zvtgW0Ajda6dd1CFiel7l8h6HiIg'
});

//config
app.set('views',__dirname + '/views');
app.engine('handlebars',exphbs({defaultLayout: 'main'}));
app.set('view engine','handlebars');
app.use('/css', express.static(path.join(__dirname, '/css')));
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/img', express.static(path.join(__dirname, '/img')));

//datafields
var tweets_obj;
var stream_sting = '[';
var stream_obj;
var query = 'tony abbot';
var mutex = 0;
var sentiment = 0;
var surl = 'img/5.jpg';
var emo = '';
var counter = 0;
var tweet_string_1 = '[';
var tweet_string_2 = '[';
var tweet_string_3 = '[';
var break_out = 0;

//don't need this?
function wait(){	
	while(mutex < 99 && mutex > 0){}
	mutex = 1;
	return;
}


function do_some(callback){
	for(var i = 0; i<40;i++){
		sentiment = 0;

		stream_obj.forEach(function(obj){
			var sntmnt = classifier.classify(obj.text);
		    if(sntmnt == 'positive')sentiment++;
		    else if(sntmnt == 'negative')sentiment--;

		    counter++;

		});
	}
	callback();
}


function do_a_buttload(callback){
	console.log('');
	console.log("-- Do a buttload! --");
	counter = 0;
	var temp_string = stream_sting;
	temp_string += '{"text": "last one"}]';
	stream_obj = JSON.parse(temp_string);
	for(var j = 0; j < 500;j++){
		do_some(function(){
			console.log('');
			console.log('Round nr:');
			console.log(j);
			console.log('Performed this many sentiment analysis:');
			console.log(counter);
			console.log('And the sentiment was:');
			console.log(sentiment);
			console.log('');
			console.log('');
			console.log('Processing... ');
			counter =0;
		});
	}
	callback();
}


function get_da_twitter(callback){  
		if(query != undefined && query != '' && query!= ' '){						   
        client.get('search/tweets', {q: query, count: 900}, function(error, tweets, response){
		    if(error){
		   		console.log(error);
		   		throw error;
		    } 
		   	var count = 0;
		    
			tweets_obj = '[';
				
			//extracring the relevant data from the response
		    tweets.statuses.forEach(function(obj){
		    	var t = obj.text;
			   	t = t.replace(/\n/g, "\\n")
		                .replace(/\r/g, "\\r")
		                .replace(/\t/g, "\\t")
		                .replace(/\f/g, "\\f")
		                .replace(/\s/g, "")
		                .replace(/\\'/g, "")
		                .replace(/\\/g, "")
		                .replace(/\"/g, "")
		                .replace(/\ /g, "")
		                .replace(/"/g, "");

		        var sntmnt = classifier.classify(t);
		        if(sntmnt == 'positive')sentiment++;
		        else if(sntmnt == 'negative')sentiment--;
		   		
		   		console.log(sentiment);
			   	
			   	stream_sting += '{"text": "';
			   	stream_sting += t;
		        stream_sting += '"}, ';
		        count = count + 1;

			   	if(count<=300){
				   	tweets_obj += '{"text": "'; 
			        tweets_obj += t;
				   	tweets_obj += '",';
				   	
				   	tweets_obj += '"s_name": "';
				   	tweets_obj += obj.user.screen_name;
				   	tweets_obj += '",';
				   	tweets_obj += '"url": "';
				   	var tweet_url = "https://twitter.com/";
				   	tweet_url += obj.user.screen_name;
				   	tweet_url += "/status/"
				   	tweet_url += obj.id_str;
				   	tweets_obj += tweet_url;
				   	//console.log(tweet_url);
				   	
				   	tweets_obj += '",';
				   	tweets_obj += '"date_time": "';
				   	
				   	var tokens = tokenizer.tokenize(obj.created_at);
				   	var date_string = "2015-10-";
				   	date_string += tokens[2];
				   	date_string += "T";
				   	date_string += tokens[3];	
				   	date_string += ":";
				   	date_string += tokens[4];	
				   	date_string += ":";
				   	date_string += tokens[5];	
				   	date_string += "+00:00";
				   	tweets_obj += date_string;
					tweets_obj += '"},';
				   	mutex = mutex + 1;
			   	}
		   
	   		});
			


	    tweets_obj += '{"text": "neineinei","name": "Gabriele Romanato","s_name": "gabromanato","url":"https://twitter.com/gabromanato/status/275673554408837120", "date_time":"2012-12-03T18:51:11+00:00" }]';
	   
		tweets_obj = JSON.parse(tweets_obj);
		console.log(count);
		if(count != 0){
			// for presentation
			tweet_string_1 = '[';
			tweet_string_2 = '[';
			tweet_string_3 = '[';

			for(var i = 0; i<15; i++){
				tweet_string_1 += '{"url": "';
				if(tweets_obj[i] != undefined)
					tweet_string_1 += tweets_obj[i].url;

				tweet_string_1 +='"},';
				
			}
			for(var i = 15; i<30; i++){
				tweet_string_2 += '{"url": "';
				if(tweets_obj[i] != undefined)
					tweet_string_2 += tweets_obj[i].url;

				tweet_string_2 +='"},';
			}
			for(var i = 30; i<45; i++){
				tweet_string_3 += '{"url": "';
				if(tweets_obj[i] != undefined)
					tweet_string_3 +=tweets_obj[i].url;

				tweet_string_3 +='"},';
			}

			tweet_string_1 += '{"url": "https://twitter.com/gabromanato/status/275673554408837120"}]';
			tweet_string_2 += '{"url": "https://twitter.com/gabromanato/status/275673554408837120"}]';
			tweet_string_3 += '{"url": "https://twitter.com/gabromanato/status/275673554408837120"}]';

			tweet_string_1 = JSON.parse(tweet_string_1);
			tweet_string_2 = JSON.parse(tweet_string_2);
			tweet_string_3 = JSON.parse(tweet_string_3);
			

			//presentation of sentiment analysis results
			if(sentiment < -50){
				surl = 'img/1.jpg';
				emo = 'Twitter is not happy at all about ';
				emo += query;
			}
			else if(sentiment < -20){
				surl='img/2.jpg';
				emo = 'Twitter is not happy about ';
				emo += query;
			}
			else if(sentiment < 20){
				surl = 'img/3.jpg';
				emo = 'Twitter is kinda nutural to ';
				emo += query;
			}
			else if (sentiment < 50){
				surl = 'img/4.jpg';
				emo = 'Twitter is happy about ';
				emo += query;
				emo += "!";
			}
			else{
				 surl = 'img/5.jpg';
				 emo = 'Twitter is very happy about ';
				emo += query;
				emo += '!!';
			}
			console.log(emo);
		}
		else{
			tweet_string_1 = '[{"url": ""}]';
			tweet_string_2 = '[{"url": ""}]';
			tweet_string_3 = '[{"url": ""}]';

			tweet_string_1 = JSON.parse(tweet_string_1);
			tweet_string_2 = JSON.parse(tweet_string_2);
			tweet_string_3 = JSON.parse(tweet_string_3);

			surl = 'img/back.jpg';
		    emo = 'Twitter found nothing on that topic';
		
		}
		callback();
			   
	});	
	}
	else{
		//if query was empty, show blank page
		tweets_obj = '[]';
		tweet_string_1 = '[]';
		tweet_string_2 = '[]';
		tweet_string_3 = '[]';	
		tweets_obj = JSON.parse(tweets_obj);
		tweet_string_1 = JSON.parse(tweet_string_1);
		tweet_string_2 = JSON.parse(tweet_string_2);
		tweet_string_3 = JSON.parse(tweet_string_3);
		surl='img/back.jpg';
		emo= '';
		sentiment = '';
		callback();
	}
}


app.get('/',function(req,res){

	sentiment = 0;

	query = req.query.query;
		
	// if we are creating load
	if(query == "do_a_buttload"){
		do_a_buttload(function(){
			console.log("Done a buttload");
		});
		return;
	}

	get_da_twitter(function(){
		res.render('index', {
		tweet: tweets_obj,
		sentiment_nr: sentiment,
		sentiment_url: surl,
		emotion: emo,
		colum1: tweet_string_1,
		colum2: tweet_string_2,
		colum3: tweet_string_3
	})});
});

//this could be done more intelligently
client.get('search/tweets', {q: 'jens', count: 900}, function(error, tweets, response){
   if(error) throw error;

   console.log("Training classifier");
   		classifier.train();
   		console.log("Done, you are good to go!");
});

// read data set
new lazy(fs.createReadStream('./dataset3.csv'))
    .lines
    .forEach(function(line){
     	var t = tokenizer.tokenize(line.toString());

     	var s = ' ';
     	for(var i = 3; i < t.length;i++){
     		s += t[i];
     		s += ' ';  
     	}

        if(t[1] == 0)
        	classifier.addDocument( s, 'negative');
        else if(t[1]== 1)
			classifier.addDocument( s, 'positive');
    }     
);


var server=app.listen(3000,function(){
	console.log("Express is running on port 3000");
	
});
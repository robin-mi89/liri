var twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");
var fs = require("fs");
var keys = require('./keys.js');

var operation = process.argv[2];
// nice use of `.slice` here
var parameters = process.argv.slice(3);
chooseOperation(operation, parameters);

function chooseOperation(operation, parameters)
{
    //console.log(operation);
    switch(operation) {
        case "my-tweets":
            getTweets(parameters);
            break;
        case "spotify-this-song":
            spotifySong(parameters);
            break;
        case "movie-this":
            movie(parameters);
            break;
        case "do-what-it-says":
            doIt(parameters);
            break;
        default:
            console.log("Please enter a correct operation");
    } 
}

function getTweets(parameters)
{
  var params = {screen_name: "realDonaldTrump"};

  // since you've already named your twitter keys the same as what the Twitter client expects
  // you can simply pass those in instead of redundantly naming them.
  var client = new twitter(keys.twitterKeys)

    console.log(parameters);
    if (parameters.length > 0)
    {
        params = {screen_name: parameters.join(" ")};
    }
    
    var returned = "Twitter Operation Performed With Parameter Screen Name: " + params + "\n";
   console.log(params.screen_name)
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
    if (!error) {
        //console.log(tweets);
        for (i=0; i<tweets.length; i++)
        {
            //console.log(tweets[i].text);
            returned += tweets[i].text;
            returned += "\r\n\r\n";
        }
        returned += "=================================================\r\n";
        console.log(returned);
        save(returned);
    }
    });
}

function spotifySong(parameters)
{
    //to be returned: 
    // Artist(s)
    // The song's name
    // A preview link of the song from Spotify
    // The album that the song is from
    var returned = "";
    if (parameters.length <= 0) //if no parameters, default song used.
    {
        song = "'The Sign' by Ace of Base";
    }
    else
    {
        song = parameters.join(" "); //joins args after command with string between them to separate words. 
    }
    returned += "operation performed: spotify \r\n";
    returned += "Song to Search For: " + song + "\r\n";
    spotify.search({ type: 'track', query: song }, function(err, data) //spotify search query
    {
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }

        // when you find yourself accessing such a deeply nested piece of data
        // you can go ahead and assign it to a variable for the sake of readability
        // also you save a few keystrokes 💁
        var track = data.tracks.items[0]

        returned += "Artist: " + track.artists[0].name + "\r\n";
        returned += "Song name: " + track.name + "\r\n";
        returned += "Album: " + track.album.name + "\r\n";
        returned += "Preview Link: " + track.preview_url + "\r\n";
        returned += "========================================================================\r\n";
        console.log(returned);
        save(returned);
        //console.log(JSON.stringify(data, null, 2));
    });
}

function movie(parameters)
{
//    * Title of the movie.
//    * Year the movie came out.
//    * IMDB Rating of the movie.
//    * Country where the movie was produced.
//    * Language of the movie.
//    * Plot of the movie.
//    * Actors in the movie.
//    * Rotten Tomatoes Rating.
//    * Rotten Tomatoes URL.

    // by declaring title within this function you can prevent it from polluting the global scope
    var title

    if (parameters.length <= 0)
    {
        title = "Mr Robot";
    }
    else
    {
        title = parameters.join(" ");
    }
    var returned = "";
    returned += "operation performed: Movie \r\n";
    returned += "Movie to Search For: " + title + "\r\n";
    //console.log(title);
    request("http://www.omdbapi.com/?t="+title+"&y=&plot=short&r=json", function(err, response, body)  //request takes 2 params, 1. url, 2. function(err, response, body)
    {
        if (!err)
        {
            //console.log(JSON.stringify(body, null, 2));

            // Instead of repeatedly parsing the body, you can simply redefine the body as it's parsed result
            // and then you can save yourself a few key strokes and a few computing cycles
            body = JSON.parse(body)

            returned += "the movie's name is: " + body.Title + "\r\n";
            returned += "the movie's release date is: " + body.Released + "\r\n";
            returned += "the movie's rating is: " + body.imdbRating + "\r\n";
            returned += "the movie was produced in: " + body.Country + "\r\n";
            returned += "the language of the movie is: " + body.Language + "\r\n";
            returned += "the movie was produced in: " + body.Country + "\r\n";
            returned += "the language of the movie is: " + body.Language + "\r\n";
            returned += "Plot: " + body.Plot + "\r\n";
            returned += "Actors: " + body.Actors + "\r\n";


            // alays try to use strict equality checking
            if (body.Ratings !== undefined)
            {
                body.Ratings.forEach(function(element) 
                {
                    if (element.Source === "Rotten Tomatoes")
                    returned += "Tomatoes Rating: " + element.Value + "\r\n";
                });
            }
            else
            {
                returned += "No ratings found" + "\r\n";
            }
            returned += "Website URL: " + body.Website + "\r\n";
            returned +="=================================================\r\n";
            console.log(returned);
            save(returned);
        }
    });
}

function doIt()
{
    var fileName = "random.txt";
    fs.readFile(fileName, "utf8", function(err, data) //readFile arguments: 1. file name, 2. file encoding, 3. callback function. 
    {
        if (err)
        {
            console.log(err);
            return;
        }
        // console.log(data);
        var newParams = data.split(",");
       
        console.log(newParams);
        chooseOperation(newParams[0], newParams[1].split(" "));
    });
}

function save(toWrite)
{
    fs.appendFile("log.txt", toWrite, function(err)
    {
        if (err)
        {
            console.log(err);
            return;
        }
        console.log("Log successfully saved.");
    });
}
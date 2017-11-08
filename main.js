var Twitter = require('twitter');
var Discord = require('discord.js');

let discordToken = process.env.DISCORD_TOKEN;
let twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
let twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
let twitterTokenKey = process.env.TWITTER_TOKEN_KEY;
let twitterTokenSecret = process.env.TWITTER_TOKEN_SECRET;

let triggerWords = ['adds', 'lists', 'live'];
// @binance_2017, @bithumbofficial, @bitfinex, @richiela, testaccount
let accounts = ['877807935493033984', '908496633196814337', '886832413', '16324992', '928316238186598400'];

var bot = new Discord.Client();
var twitterClient;
let currentChannel;

connect();

function connect() {
	bot.login(discordToken);
	twitterClient = new Twitter({
		consumer_key: twitterConsumerKey,
		consumer_secret: twitterConsumerSecret,
		access_token_key: twitterTokenKey,
		access_token_secret: twitterTokenSecret
	  });
}

// Filter tweets
let followStr = accounts.join(',');
twitterClient.stream('statuses/filter', {follow: followStr},  function(stream) {
	stream.on('data', function(tweet) {
	  console.log('Tweet: ' + tweet.text);
	  filterMessage(tweet);
	});
  
	stream.on('error', function(error) {
	  console.log(error);
	});
  });


function filterMessage(tweet) {
	let formattedMsg = tweet.text.toLowerCase();
	triggerWords.forEach((el) => {
		if(formattedMsg.includes(el)) {
			broadcastTweet(tweet);
			return;
		}
	});
}

function broadcastTweet(tweet) {
	//console.log(JSON.stringify(tweet));
	let msg = '@' + tweet.user.screen_name;
	msg += ' - \"';
	msg += tweet.text;
	msg += '\" - https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str;
	say(msg);
}

function say(message) {
	if(currentChannel != null) {
		currentChannel.sendMessage(message);
	}
}

// Set up
bot.on('ready', () => {
	console.log('Discord Connected.');
	console.log('Channels found: ');
	bot.channels.forEach(function(channel) {
		console.log('Channel: ' + channel.id);
	});
});

bot.on('message', msg => {
	if(msg.content.startsWith('/cryptweet')) {
		if(msg.content.includes('focus')) {
			console.log(`Focus on channel: ` + msg.channel.id);
			msg.reply(`Broadcasting to this channel...`);
			currentChannel = msg.channel;
		}
		else if(msg.content.includes('help')) {
			msg.channel.send(`This bot is maintained by: @legen-waitforit-dary#9748`);
			msg.channel.send(`Get the source at: https://github.com/tjw0051/cryptweet-bot`);
		}
	}
});


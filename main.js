var Twitter = require('twitter');
var Discord = require('discord.js');

let discordToken = process.env.DISCORD_TOKEN;
let twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
let twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
let twitterTokenKey = process.env.TWITTER_TOKEN_KEY;
let twitterTokenSecret = process.env.TWITTER_TOKEN_SECRET;

let triggerWords = ['adds', 'lists', 'live', 'communitycoin'];
// @binance_2017, @bithumbofficial, @bitfinex, @richiela, testaccount
let accounts = ['877807935493033984', '908496633196814337', '886832413', '16324992', '928316238186598400'];
let testAccount = '928316238186598400';

var bot = new Discord.Client();
var twitterClient;
let currentChannel;
let testChannel;

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
	console.log(JSON.stringify(tweet));
	if(tweet.in_reply_to_status_id != null || tweet.in_reply_to_user_id != null) {
		return;
	}

	if(tweet.retweeted == true || tweet.retweeted_status != null) {
		return;	
	}

	let formattedMsg = tweet.text.toLowerCase();
	triggerWords.forEach((el) => {
		if(formattedMsg.includes(el)) {
			let formatMsg = formatRichMessage(tweet);
			if(tweet.user.id_str == testAccount) {
				broadcastRichTweet(formatMsg, 'test');
			} else {
				broadcastRichTweet(formatMsg, 'live');
			}
			return;
		}
	});
}

function formatMessage(screenName, text, tweetId) {
	let msg = '@' + screenName;
	msg += ' - \"';
	msg += text;
	msg += '\" - https://twitter.com/' + screenName + '/status/' + tweetId;
	return msg;
}

function formatRichMessage(tweet) {
	let name = tweet.user.screen_name;
	let prettyName = '@' + name;
	let text = tweet.text;
	let prettyText = `"${text}"`; 
	let tweetId = tweet.id_str;
	let userImg = tweet.user.profile_image_url;
	let userUrl = 'https://twitter.com/' + name;
	let tweetUrl = 'https://twitter.com/' + name + '/status/' + tweetId;

	let richEmbed = new Discord.RichEmbed({
			//title: 'title',
			description: prettyText,
			author: {
				name: prettyName,
				url: userUrl,
				icon_url: twitterImg
			},
			thumbnail: {
				url: userImg,
				height: 20,
				width: 20
			},
			footer: {
				text: tweetUrl,
				icon_url: twitterImg
			}
	});
	richEmbed.setColor('GREEN');
	return richEmbed;
}

function broadcastRichTweet(richTweet, channel) {
	if(channel == 'live' && currentChannel != null) {
		currentChannel.send('', { embed: richTweet });
	}
	if(channel == 'test' && testChannel != null) {
		testChannel.send('', { embed: richTweet });
	}
}

function broadcastTweet(message, userId) {
	if(userId == testAccount) {
		say(message, 'test');
	} else {
		say(message, 'live');
	}
}

function say(message, channel) {
	switch(channel) {
		case 'live':
			if(currentChannel != null) {
				currentChannel.sendMessage(message);
			}
		break;
		case 'test':
			if(testChannel != null) {
				testChannel.say(message);
			}
		break;
	}
}

// Set up
bot.on('ready', () => {
	console.log('Discord Connected.');
	console.log('Channels found: ');
	bot.channels.forEach(function(channel) {
		console.log('Channel: ' + channel.id);
		if(channel.id == '377590329374801931') {
			currentChannel = channel;
			console.log('Broadcasting on channel ' + channel.id);
		}
		if(channel.id == '265296777656270848') {
			testChannel = channel;
			console.log('Joined test channel ' + channel.id);
		}
	});
});

bot.on('message', msg => {
	let splitMsg = msg.content.split(' ');
	if(splitMsg.length < 2) {
		return;
	}
	if(splitMsg[0] == '/cryptweet') {
		switch(splitMsg[1]) {
			case 'focus': 
				console.log(`Focus on channel: ` + msg.channel.id);
				msg.reply(`Broadcasting to this channel...`);
				currentChannel = msg.channel;
			break;
			case 'help':
				msg.channel.send(`This bot is maintained by: @legen-waitforit-dary#9748`);
				msg.channel.send(`Get the source at: https://github.com/tjw0051/cryptweet-bot`);
			break;
			case 'manual':
				let cleanMsg = msg.content.replace('manual', '');
				cleanMsg = cleanMsg.replace('/cryptweet', '');
				cleanMsg = cleanMsg.trim();
				try {
					let json = JSON.parse(cleanMsg);
					console.log(JSON.stringify(json));
					console.log('broadcasting tweet manually...');
					msg.reply('Broadcasting message manually...');
					broadcastTweet(formatMessage(json.screenName, json.text, json.tweetId), '0');
				} catch(e) {
					console.log('Error: badly formatted JSON.');
					msg.reply('Error: badly formatted JSON.');
				}
			break;
			new Discord.RichEmbed()
			case 'example':
				let msgEmbed = formatRichMessage({
					user: {
						screen_name: '@legendex_2017',
						profile_image_url: 'https://pbs.twimg.com/profile_images/877809641375137792/397UDjy4_bigger.jpg'
					},
					text: '#legendex_2017 Lists $BTC',
					id_str: '929020557797896194',
				});
				msg.channel.send('', { embed: msgEmbed });
			break;
		}
	}
});

const twitterImg = 'https://cdn1.iconfinder.com/data/icons/iconza-circle-social/64/697029-twitter-512.png';
const exampleEmbed = {
	title: 'title',
	description: 'description',
	url: 'https://example.com',
	
	fields: [{
		name: 'field 1',
		value: 'value 1',
		inline: true
	}],
	author: {
		name: 'author',
		url: 'https://example.com',
		icon_url: 'https://cdn1.iconfinder.com/data/icons/iconza-circle-social/64/697029-twitter-512.png'
	},
	thumbnail: {
		url: 'https://cdn1.iconfinder.com/data/icons/iconza-circle-social/64/697029-twitter-512.png',
		height: 20,
		width: 20
	},
	image: {
		url: 'https://cdn1.iconfinder.com/data/icons/iconza-circle-social/64/697029-twitter-512.png',
		height: 100,
		width: 100
	},
	footer: {
		text: 'footer',
		icon_url: 'https://cdn1.iconfinder.com/data/icons/iconza-circle-social/64/697029-twitter-512.png'
	}
};


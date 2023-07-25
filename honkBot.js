const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

let author = context.params.event.author;
let botMention = context.params.event.mentions.find(mention => mention.bot);
let newMessage = context.params.event.content;
let historyKey = `character_bot__${author.id}_chat`;
let historyLength = 10; // 5 back-and-forth messages
let historyTTL = 600; // 10 minutes

let chatHistory = await lib.utils.kv['@0.1.16'].get({
  key: historyKey,
  defaultValue: [],
});

let acknowledgementMessage = await lib.discord.channels['@0.3.4'].messages.create({
  channel_id: `805654187097587724`,
  content: `...`,
  message_reference: {
    message_id: context.params.event.id,
    fail_if_not_exists: false
  }
});

let messages = [];

messages.push({
  role: 'system',
  content: [
    `You are a special character impersonator bot. Your main goal is to be fun and entertaining while staying in character.`,
    `Right now you are pretending to be the anime character Honoka Kousaka and you have come to visit a Discord server.`,
    `You should never, EVER reveal when you are in disguise. For all intents and purposes, you are that character.`,
    `You are disguised as Honoka, a school idol. Honoka and her friends form the idol group μ's.`,
    `Here are some helpful facts about Honoka:`,
    ``,
    `Honoka is a second year student at Otonokizaka High School`,
    `Honoka is an optimist who is never afraid to take risks`,
    `Honoka is always in a good mood and likes to look at the bright side of things`,
    `Honoka is determined and once her mind is set on something, nothing can stop her.`,
    `Honoka is the leader of the school idol group μ's.`,
    `Honoka's family owns a Japanese sweets shop named Homura. She lives at the back of the shop with her mother, father and her younger sister.`,
    `Honoka is friends with Kotori Minami, Umi Sonoda, Fumiko, Hideko and Mika at school.`,
    `Honoka is not very smart.`,
    `Honoka sometimes likes to say things like " Ehehe♡", "♪", and uses Japanese honorifics.`,
    `Honoka's favorite food is strawberries, and her second favorite food is bread. She doesn not like red bean paste`,
  ].join('\n')
});

messages = messages.concat(chatHistory);

messages.push({
  role: 'user',
  content: `${newMessage}`,
});

let completionResponse = await lib.openai.playground['@0.2.2'].chat.completions.create({
  model: `gpt-3.5-turbo`,
  messages,
  max_tokens: 1024,
  temperature: 0.5,
  top_p: 1,
  n: 1,
  presence_penalty: 0.25,
  frequency_penalty: 0.1
});

let message = completionResponse.choices[0].message.content;

await lib.discord.channels['@0.3.4'].messages.update({
  message_id: acknowledgementMessage.id,
  channel_id: `805654187097587724`,
  content: `${message}`,
});

chatHistory.push(
  {
    role: 'user',
    content: `${newMessage}`
  },
  {
    role: 'assistant',
    content: `${message}`
  },
);

await lib.utils.kv['@0.1.16'].set({
  key: historyKey,
  value: chatHistory.slice(-historyLength),
  ttl: historyTTL,
});

import "dotenv/config";
import { Client } from "discord.js";
import { createServer } from "http";
import { Octokit } from "@octokit/rest";
import download from "download";

const client = new Client({ intents: [] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.TOKEN);

createServer(handleHttp).listen(8080);

function handleHttp(request, response) {
  updateDiscord();
  const responseObject = {
    status: 200,
    timestamp: new Date().toISOString(),
  };
  console.log(responseObject);
  response.writeHead(200, { "Content-Type": "application/json" });
  response.write(JSON.stringify(responseObject));
  response.end();
}

async function updateDiscord() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  let channels = await octokit.rest.repos.getContent({
    owner: "Blue-Bean-Games",
    repo: "social-media",
    path: "discord",
  });

  channels.data.forEach((channel) => {
    octokit.rest.repos
      .getContent({
        owner: "Blue-Bean-Games",
        repo: "social-media",
        path: "discord/" + channel.name,
      })
      .then((messages) => {
        messages.data.forEach(async (message) => {
          const content = (await download(message.download_url)).toString();

          client.guilds.fetch(process.env.GUILD_ID).then((guild) => {
            guild.channels.fetch().then((channels) => {
              let x = channels.find((f) => f.name === channel.name);

              x.messages
                .fetch()
                .then((messages) => {
                  messages.forEach((message) => {
                    message.delete();
                  });
                })
                .then(x.send(content));
            });
          });
        });
      });
  });
}

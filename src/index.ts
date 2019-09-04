import DiscordRPC from "discord-rpc";
import { loadConfig } from "./config";
import { registerUpdateRequest, updateActivity } from "./update";
import { startCommandLineInput } from "./console";

console.log("School Discord Rich Presence");
console.log("Developed by Alex4386: MIT License Extended with HRPL");

try {
    loadConfig();
} catch {
    console.error("Error while loading config!");
    console.error("Did you configured the Rich Presence? go to config/config.json to configure it!");
}

console.debug("Registering Discord RPC with client ID: "+loadConfig().discord.clientId);
DiscordRPC.register(loadConfig().discord.clientId);

export const rpc = new DiscordRPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
    console.debug("Discord RPC Ready!");

    updateActivity(rpc);
    registerUpdateRequest(rpc);

    startCommandLineInput();
});

console.debug("Logging In to Discord RPC with client ID: "+loadConfig().discord.clientId)
rpc.login({ clientId: loadConfig().discord.clientId }).catch(console.error);

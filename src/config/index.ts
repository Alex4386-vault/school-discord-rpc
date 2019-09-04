import fs from "fs";
import DiscordRPC from "discord-rpc"

export interface ConfigInterface {
    discord: DiscordConfigInterface;
    defaultRPC: DiscordRPC.Presence;
    subjects: SubjectInterface[];
}

export interface SubjectInterface {
    state: string;
    details: string;
    timestamp: string;
    largeImage: ImageInterface;
    smallImage: ImageInterface;
}

export interface ImageInterface {
    key: string;
    text: string;
}

export interface DiscordConfigInterface {
    clientId: string;
    updateRequestMilliseconds: number;
}

export function loadConfig(): ConfigInterface {
    const config = JSON.parse(fs.readFileSync("config/config.json", { encoding: "utf-8" })) as unknown as ConfigInterface;
    return config;
}

import DiscordRPC from "discord-rpc";
import { loadConfig, SubjectInterface } from "../config";
import { rpc } from "..";

const config = loadConfig();
let theInterval: NodeJS.Timeout | null = null;

let startDateTimeout = null;
let currentActivity: DiscordRPC.Presence = {
    state: config.defaultRPC.state,
    details: config.defaultRPC.details,
    startTimestamp: new Date().getTime()
};

export function loadDefaultConfig() {
    currentActivity = {
        state: config.defaultRPC.state,
        details: config.defaultRPC.details,
        startTimestamp: new Date().getTime()
    };
}

export function setActivity(activity: DiscordRPC.Presence) {
    currentActivity = { ...currentActivity, ...activity };
}

export function updateActivity(client: DiscordRPC.Client) {
    client.setActivity(currentActivity);
}

export function setStartDate(date: Date, timeout?: Function) {
    if (startDateTimeout !== null) clearTimeout(startDateTimeout);
    if (arguments.length < 1) {
        currentActivity.startTimestamp = new Date().getTime();
    } else {
        if (new Date().getTime() > date.getTime()) {
            currentActivity.startTimestamp = date.getTime();
            if (typeof timeout === "function") timeout();
        } else {
            currentActivity.endTimestamp = date.getTime();

            startDateTimeout = setTimeout( () => {
                startDateTimeout = null;
                currentActivity.endTimestamp = new Date().getTime();
                currentActivity.startTimestamp = date.getTime();
                if (typeof timeout === "function") timeout();
            }, date.getTime() - new Date().getTime())
        }
    }
    currentActivity.startTimestamp = (arguments.length < 1) ? new Date().getTime() : date.getTime();
}

export function registerUpdateRequest(client: DiscordRPC.Client) {
    if (loadConfig().discord.updateRequestMilliseconds < 15000) {
        console.error("Error: Discord Rich Presence might not work properly. minimum possible updateRequest is 15000ms");
    }
    if (theInterval !== null) {
        console.error("Error: Update Request Already Registered. Quitting.");        
        return;
    }

    theInterval = setInterval( () => {
        updateActivity(client);
    }, 15000);
}

export function unregisterUpdateRequest() {
    if (theInterval === null) {
        console.error("Error: Update Request is not Registered. Quitting.");
        return;
    }
    clearInterval(theInterval);
}

export async function gracefullyShutdown(client: DiscordRPC.Client) {
    unregisterUpdateRequest();
    await client.destroy();
}

export function updateSubject(subject: SubjectInterface) {

    if (!isNaN(new Date(subject.timestamp).getTime()) && subject.timestamp !== null) {
        setStartDate(new Date(subject.timestamp), () => {
            updateActivity(rpc);
            console.log("CountDown Finished! Starting Counting Up!");
        });
    } else {
        console.log("Invalid Time! not updating it!");
    }

    setActivity({
        state: subject.state,
        details: subject.details
    });

    if (subject.smallImage !== null && typeof subject.smallImage !== "undefined") {
        setActivity({
            smallImageKey: subject.smallImage.key,
            smallImageText: subject.smallImage.text
        });
    } else {
        setActivity({
            smallImageKey: null,
            smallImageText: null
        });
    }

    if (subject.largeImage !== null && typeof subject.largeImage !== "undefined") {
        setActivity({
            largeImageKey: subject.largeImage.key,
            largeImageText: subject.largeImage.text
        });
    } else {
        setActivity({
            largeImageKey: null,
            largeImageText: null
        });
    }

    console.log("Subject Set to:",subject.details);
}
import readline from "readline";
import { rpc } from "../";  
import { gracefullyShutdown, setActivity, updateActivity, setStartDate, updateSubject, loadDefaultConfig } from "../update";
import { loadConfig } from "../config";

export const consoleInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export interface CommandParseResult {
    success: boolean;
    data: CommandParseData;
}

export interface CommandParseData {
    command: string;
    arguments: string[];
}

export function commandParser(cmd: string): CommandParseResult {
    return {
        success: true,
        data: {
            command: cmd.split(' ')[0].toLowerCase(),
            arguments: cmd.split(' ').splice(1)
        }
    }
}

export function startCommandLineInput() {
    consoleInterface.question("> ", (out) => {
        commandRunner(out);
        startCommandLineInput();
    });
}

export function commandRunner(cmd: string) {
    const parsedCommand = commandParser(cmd);
    const stringArgument = parsedCommand.data.arguments.join(' ');
    const config = loadConfig();
    switch (parsedCommand.data.command) {
        case "exit":
            console.log("Exiting Discord RPC!");
            gracefullyShutdown(rpc);
            process.exit(0);
            break;
        case "set-state":
            console.log("Setting State: "+stringArgument);
            setActivity({
                state: stringArgument
            });
            break;
        case "set-details":
            console.log("Setting Details: "+stringArgument);
            setActivity({
                details: stringArgument
            });
            break;
        case "set-time":
            console.log("Setting Time: "+stringArgument);
            if (!isNaN(new Date(stringArgument).getTime())) {
                setStartDate(new Date(stringArgument), () => {
                    updateActivity(rpc);
                    console.log("CountDown Finished! Starting Counting Up!");
                })
            } else {
                if (stringArgument.toLowerCase() === "now") {
                    setStartDate(new Date());
                } else {
                    console.log("Invalid Time!");
                }
            }
            break;
        case "list":
            console.log("List: ");
            console.log(" ");
            for (let i = 0; i < config.subjects.length; i++) {
                console.log(i+".",config.subjects[i].details);
            }
            break;
        case "help":
            console.log("Commands:");
            console.log("set-details <state>","Sets Detail of Rich Presence");
            console.log("set-state <state>", "Set State of Rich Presence.");
            console.log("set-time <UTC Time String>", "Set Countdown or CountUp to specified time");
            console.log("list", "list currently preconfigured subjects");
            console.log("set <subject no>", "set current subject to specified preconfigured subject");
            console.log("update", "override the regular update schedule and force update rich presence (spamming might cause temp-ban)")
            break;
        case "set":
            if (stringArgument.toLowerCase() === "default") { loadDefaultConfig(); return; }
            const wa = parseInt(stringArgument);
            if (wa >= config.subjects.length) { console.log("Error! out of index!"); return; }
            const subject = config.subjects[wa];
            updateSubject(subject);
            break;
        case "update":
            console.log("Updating Activity Manually");
            updateActivity(rpc);
            break;
        default:
            console.log("Invalid Command!");
            break;
    }
}


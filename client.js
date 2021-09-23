const { Socket } = require("net");

const readLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

const error = (message) => {
    console.error(message);
    process.exit(1);
}

const END = "END";

const connect = (host, port) => {
    console.log(`Connecting to ${host}:${port}`);

    const socket = new Socket();
    socket.connect({ host, port });

    socket.setEncoding("utf-8");

    socket.on("connect", () => {
        console.log('Connected');

        readLine.question("Choose your username: ", (username) => {
            socket.write(username);
            console.log(`Type any message to send it, type ${END} to finish`);
        });

        readLine.on("line", (message) => {
            socket.write(message);
            if (message === END) {
                socket.end();
                console.log("Disconneted");
            }
        });
    
        socket.on("data", (data) => {
            console.log(data);
        });
    
        socket.on("close", () => process.exit(0));
    });

    socket.on("error", (err) => error(err.message));
}

const main = () => {
    if (process.argv.length !== 4){
        error(`Usage: node ${__filename} host port`);
    }

    let [, , host, port] = process.argv;
    if (isNaN(port)) {
        error(`Invalid port: ${port}`);
    }
    port = Number(port);
    
    connect(host, port);
}

if (module === require.main) {
    // Server.js no puede estar incluido en otro .js y debe ser el principal
    main();
}
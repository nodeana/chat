const { Server } = require("net");

const host = "127.0.0.1";
const END = "END";

const error = (message) => {
    console.error(message);
    process.exit(1);
}

const connections = new Map();

const sendMessage = (message, origin) => {
    // Difundir el mensaje a todos menos al origen
    for (const socket of connections.keys()) {
        if (socket !== origin) {
            socket.write(message);
        }
    }
}

const listen = (port) => {
    const server = new Server();
    
    server.on("connection", (socket) => {
        const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
        console.log(`New connection from ${remoteSocket}`);
    
        socket.setEncoding("utf-8");

        socket.on("data", (message) => {
            if (!connections.has(socket)) {
                console.log(`Username [${message}] set for connection ${remoteSocket}`);
                connections.set(socket, message);
            } else if (message === END) {
                connections.delete(socket);
                socket.end();

            } else {
                // Enviar el mensaje al resto de clientes

                const fullMessage = `[${connections.get(socket)}]: ${message}`;
                console.log(`${remoteSocket} -> ${fullMessage}`);
                sendMessage(fullMessage, socket);
            }
        });
    
        socket.on("close", () => {
            console.log(`Connection with ${remoteSocket} closed`);
        });

        socket.on("error", (err) => error(err.message));
    });
    
    server.listen({ port, host }, () => {
        console.log(`Listening on Port ${port}`);
    });

    server.on("error", (err) => error(err.message));
}

const main = () => {
    if (process.argv.length !== 3){
        error(`Usage: node ${__filename} port`);
    }

    let port = process.argv[2];
    if (isNaN(port)) {
        error(`Invalid port: ${port}`);
    }

    port = Number(port);

    listen(port);
}

if (module === require.main) {
    // Server.js no puede estar incluido en otro .js y debe ser el principal
    main();
}
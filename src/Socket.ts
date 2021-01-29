// Socket
import { io } from 'socket.io-client';

export interface PigContext {
    id: number;
    position: { x: number, y: number };
}

// Expected response interfaces
export interface MovementResponse {
    new_coords: {
        player1_coord_x: number;
        player1_coord_y: number;
        player2_coord_x: number;
        player2_coord_y: number;
    }
}

export class Socket {

    /**
     * Connected socket instance
     */
    private static socket;

    /**
     * Unique ID given from the server upon connection.
     */
    private static id: string;

    /**
     * URL of the websocket instance. This comes from config.
     */
    private static url: string = 'https://guineadig.parlette.org';

    /**
     * Connects to the server. Assumes socket will be running on /socket.io.
     */
    public static connect() {
        Socket.socket = io(Socket.url, {
            path: '/socket.io',
            transports: ['websocket']
        });
    }

    /**
     * Returns the socket instance. May not need this...
     */
    public static getInstance() {
        return Socket.socket;
    }

    /**
     * Returns the current socket ID. This changes on every connect.
     */
    public static getId() {
        return Socket.socket.id;
    }

    /**
     * Listen for an event from the server.
     */
    public static listen(event: string, callback: (args) => void) {
        Socket.socket.on(event, callback);
    }

    /**
     * Listen for an event from the server.
     */
    public static emit(event: string, payload: any) {
        Socket.socket.emit(event, payload);
    }
}

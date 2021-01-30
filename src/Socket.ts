// Socket
import { io } from 'socket.io-client';

export interface PigContext {
    id: number;
    position: { x: number, y: number };
}

export interface Response extends Room {}

export interface Room {
    room_id: string;
    players: Player[];
}

export interface Player {
    id: number;
    sid: string;
    x: number;
    y: number;
}

export class Socket {

    // Event keys
    public static MOVE = 'move';
    public static CREATE_ROOM = 'create_room';
    public static JOIN_ROOM = 'join_room';

    // Response keys
    public static MOVE_RESPONSE = 'move_response';
    public static CREATE_ROOM_RESPONSE = 'create_room_response';
    public static JOIN_ROOM_RESPONSE = 'join_room_response';

    /**
     * Connected socket instance
     */
    private static socket;

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
     * Returns the current socket ID. This changes on every connect.
     */
    public static getId() {
        return Socket.socket.id;
    }

    /**
     * Listen for an event from the server.
     */
    public static listen(event: string, callback: (args: Response) => void) {
        Socket.socket.on(event, callback);
    }

    /**
     * Listen for an event from the server.
     */
    public static emit(event: string, payload?: any) {
        Socket.socket.emit(event, payload);
    }
}

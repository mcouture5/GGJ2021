import os
import tornado.ioloop
from tornado.options import define, options, parse_command_line
import tornado.web
import socketio
import string
import random

define("port", default=5000, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sio = socketio.AsyncServer(async_mode='tornado', cors_allowed_origins=[])
_Handler = socketio.get_tornado_handler(sio)

rooms = {}
sids = {}

async def background_task():
	"""Example of how to send server generated events to clients."""
	count = 0
	while True:
		await sio.sleep(10)
		count += 1
		await sio.emit('my_response', {'data': 'Server generated event'})


# Handlers
class SocketHandler(_Handler):
	def check_origin(self, origin):
		return True

	def set_default_headers(self):
		self.set_header("Content-Type", "application/json")
		self.set_header("Access-Control-Allow-Origin", "*")
		self.set_header("Access-Control-Allow-Headers", "content-type")
		self.set_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PATCH, PUT')

class MainHandler(tornado.web.RequestHandler):
	def get(self):
		self.render("app.html")


@sio.event
async def move(sid, message):
	current_room = sids[sid]
	if message['direction'] == 'left':
		room[current_room]['player_coords']['player1_coord_x'] -= 1
	elif message['direction'] == 'right':
		room[current_room]['player_coords']['player1_coord_x'] += 1
	elif message['direction'] == 'up':
		room[current_room]['player_coords']['player1_coord_y'] -= 1
	elif message['direction'] == 'down':
		room[current_room]['player_coords']['player1_coord_y'] += 1
	await sio.emit('move_response', {'new_coords': room[current_room]['player_coords']}, room=current_room)


@sio.event
async def my_event(sid, message):
	await sio.emit('my_response', {'data': message['data']}, room=sid)


@sio.event
async def my_broadcast_event(sid, message):
	await sio.emit('my_response', {'data': message['data']})


@sio.event
async def join(sid, message):
	sio.enter_room(sid, message['room'])
	room[message['room']]['player2_sid'] = sid
	await sio.emit('my_response', {'data': 'Entered room: ' + message['room']}, room=sid)

@sio.event
async def leave(sid, message):
	sio.leave_room(sid, message['room'])
	await sio.emit('my_response', {'data': 'Left room: ' + message['room']}, room=sid)


@sio.event
async def close_room(sid, message):
	await sio.emit('my_response', {'data': 'Room ' + message['room'] + ' is closing.'}, room=message['room'])
	await sio.close_room(message['room'])


@sio.event
async def my_room_event(sid, message):
	await sio.emit('my_response', {'data': message['data']}, room=message['room'])

# -----
# Connect and disconnect events
@sio.event
async def disconnect_request(sid):
	await sio.disconnect(sid)

@sio.event
async def connect(sid, environ):
	new_room = gen_four_chars()
	room[new_room] = {
		'player1_sid': sid, 
		'player2_sid': None, 
		'player_coords': {
			'player1_coord_x': 10,
			'player1_coord_y': 10, 
			'player2_coord_x': 80,
			'player2_coord_y': 80
		}
	}
	sids[sid] = new_room
	sio.enter_room(sid, new_room)
	await sio.emit('connect_response', {'room_id': new_room}, room=new_room)

@sio.event
def disconnect(sid):
	print('Client disconnected')

# -----
# Helper functions
def gen_four_chars():
	return ''.join(random.choices(string.ascii_lowercase, k=4))


# -----
# Main Tornado web server
def main():
	parse_command_line()
	app = tornado.web.Application(
		[
			(r"/", MainHandler),
			(r"/socket.io/", SocketHandler),
		],
		template_path=os.path.join(os.path.dirname(__file__), "templates"),
		static_path=os.path.join(os.path.dirname(__file__), "static"),
		debug=options.debug,
	)
	app.listen(options.port)
	tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
	main()
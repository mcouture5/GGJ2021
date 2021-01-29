import os
import tornado.ioloop
from tornado.options import define, options, parse_command_line
import tornado.web
import socketio
import string
import random
import logging


logger = logging.getLogger(__name__)
f_handler = logging.RotatingFileHandler('/home/ec2-user/guineadig.log', maxBytes=1048576, backupCount=12)
f_handler.setLevel(logging.INFO)
f_format = logging.Formatter('%(asctime)s - %(message)s')
f_handler.setFormatter(f_format)
logger.addHandler(f_handler)
logging.getLogger("tornado.access").handlers = []
logging.getLogger("tornado.application").handlers = []
logging.getLogger("tornado.general").handlers = []

logging.getLogger("tornado.access").addHandler(f_handler)
logging.getLogger("tornado.application").addHandler(f_handler)
logging.getLogger("tornado.general").addHandler(f_handler)

logging.getLogger("tornado.access").propagate = False
logging.getLogger("tornado.application").propagate = False
logging.getLogger("tornado.general").propagate = False

#logging.basicConfig(filename='/home/ec2-user/guineadig.log', encoding='utf-8', level=logging.INFO, format='%(asctime)s - %(message)s')

define("port", default=5000, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sio = socketio.AsyncServer(async_mode='tornado', cors_allowed_origins=[])
_Handler = socketio.get_tornado_handler(sio)

rooms = {}
sids = {}


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
	logger.info(f"Received move signal from {sid} to move {message['direction']}")
	current_room = sids[sid]
	current_player = 0
	if rooms[current_room]['players'][1]['sid'] == sid:
		current_player = 1
	if message['direction'] == 'left':
		rooms[current_room]['players'][current_player]['x'] -= 1
	elif message['direction'] == 'right':
		rooms[current_room]['players'][current_player]['x'] += 1
	elif message['direction'] == 'up':
		rooms[current_room]['players'][current_player]['y'] -= 1
	elif message['direction'] == 'down':
		rooms[current_room]['players'][current_player]['y'] += 1
	await sio.emit('move_response', {'new_coords': rooms[current_room]}, room=current_room)


@sio.event
async def join(sid, message):
	sio.enter_room(sid, message['room'])
	room[message['room']]['players'][1]['sid'] = sid
	await sio.emit('my_response', {'data': 'Entered room: ' + message['room']}, room=sid)

@sio.event
async def leave(sid, message):
	sio.leave_room(sid, message['room'])
	await sio.emit('my_response', {'data': 'Left room: ' + message['room']}, room=sid)


# -----
# Connect and disconnect events
@sio.event
async def disconnect_request(sid):
	await sio.disconnect(sid)

@sio.event
async def connect(sid, environ):
	new_room = gen_four_chars()
	rooms[new_room] = {
		'room_id': new_room,
		'players': [
			{
				'sid': sid,
				'id': 0,
				'x': 10,
				'y': 10
			},
			{
				'sid': None,
				'id': 1,
				'x': 80,
				'y': 80
			}
		]
	}
	sids[sid] = new_room
	sio.enter_room(sid, new_room)
	logger.info(f"New connection from {sid} and placed into room {new_room}")
	await sio.emit('connect_response', rooms[new_room], room=new_room)

@sio.event
def disconnect(sid):
	logger.info('Client disconnected')

# -----
# Helper functions
def gen_four_chars():
	return ''.join(random.choices(string.ascii_lowercase, k=4))


# -----
# Main Tornado web server
def main():
	#access_log = logging.getLogger('tornado.access')
	#access_log.propagate = False
	#access_log.setLevel(logging.INFO)

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
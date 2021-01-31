import os
import tornado.ioloop
from tornado.options import define, options, parse_command_line
import tornado.web
import socketio
import string
import random
import logging
from logging.handlers import RotatingFileHandler
import time
import json
import datetime

# -----
# Logging setup
logger = logging.getLogger(__name__)
f_handler = RotatingFileHandler('/home/ec2-user/guineadig.log', maxBytes=1048576, backupCount=12)
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


# -----
# Tornado setup
define("port", default=5000, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sio = socketio.AsyncServer(async_mode='tornado', cors_allowed_origins=[])
_Handler = socketio.get_tornado_handler(sio)


# -----
# Global variables to store rooms and sids
rooms = {}
sids = {}
random_starters = {
	0: {'x0min':10, 'x0max':25, 'y0min':10, 'y0max':89, 'x1min':75, 'x1max':90, 'y1min':10, 'y1max':89},
	1: {'x0min':75, 'x0max':90, 'y0min':10, 'y0max':89, 'x1min':10, 'x1max':25, 'y1min':10, 'y1max':89},
	2: {'x0min':10, 'x0max':89, 'y0min':10, 'y0max':25, 'x1min':10, 'x1max':89, 'y1min':75, 'y1max':90},
	3: {'x0min':10, 'x0max':89, 'y0min':75, 'y0max':90, 'x1min':10, 'x1max':89, 'y1min':10, 'y1max':25}
}
gem_dino_room_layouts = [
	{'x':15, 'w':10, 'y':20, 'h':10},
	{'x':10, 'w':12, 'y':60, 'h':10},
	{'x':30, 'w':15, 'y':10, 'h':13},
	{'x':50, 'w':17, 'y':90, 'h':15},
	{'x':60, 'w':11, 'y':5, 'h':13},
	{'x':90, 'w':10, 'y':20, 'h':15},
	{'x':70, 'w':14, 'y':40, 'h':13},
	{'x':50, 'w':10, 'y':55, 'h':10},
	{'x':10, 'w':18, 'y':80, 'h':11},
	{'x':72, 'w':10, 'y':60, 'h':15},
]

# -----
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

class LeaderboardHandler(tornado.web.RequestHandler):
	def get(self):
		#scores = {}
		with open('/home/ec2-user/leaderboard.json', 'r') as f:
			scores = [json.loads(line) for line in f]
		sorted_scores = sorted(scores, key=lambda item: item['time'])
		rank = 1
		for score in sorted_scores:
			score['rank'] = rank
			rank += 1
		self.render("leaderboard.html", scores=sorted_scores)

class LeaderboardJsonHandler(tornado.web.StaticFileHandler):
	def set_default_headers(self):
		self.set_header("Content-Type", "application/json")
		self.set_header("Access-Control-Allow-Origin", "*")
		self.set_header("Access-Control-Allow-Headers", "content-type")
		self.set_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
# -----
# GuineaDig-specific events
@sio.event
async def move(sid, message):
	current_room = sids[sid]
	current_player = 0
	if rooms[current_room]['players'][1]['sid'] == sid:
		current_player = 1
	logger.info(f"Received move signal from {sid} to move {message['direction']} from a starting point of ({rooms[current_room]['players'][current_player]['x']}, {rooms[current_room]['players'][current_player]['y']})")
	# If the start_time on the room hasn't been set, do it now
	if rooms[current_room]['start_time'] == None:
		rooms[current_room]['start_time'] = time.time()
	if message['direction'] == 'left':
		if rooms[current_room]['players'][current_player]['x'] > 0:
			rooms[current_room]['players'][current_player]['x'] -= 1
	elif message['direction'] == 'right':
		if rooms[current_room]['players'][current_player]['x'] < 99:
			rooms[current_room]['players'][current_player]['x'] += 1
	elif message['direction'] == 'up':
		if rooms[current_room]['players'][current_player]['y'] > 0:
			rooms[current_room]['players'][current_player]['y'] -= 1
	elif message['direction'] == 'down':
		if rooms[current_room]['players'][current_player]['y'] < 99:
			rooms[current_room]['players'][current_player]['y'] += 1
	await sio.emit('move_response', rooms[current_room], room=current_room)
	elapsed_time = check_for_game_over(current_room)
	if elapsed_time:
		logger.info(f"Game should be over, elapsed_time in move function is {elapsed_time}")
		save_to_leaderboard_file(current_room)
		await sio.emit('game_end', {'elapsed_time': elapsed_time}, room=current_room)


@sio.event
async def join_room(sid, message):
	logger.info(f"Client {sid} is attempting to join room {message['room']}")
	sio.enter_room(sid, message['room'])
	#rooms[message['room']]['players'][1]['sid'] = sid
	room_id = message['room']
	seed = rooms[room_id]['random_seed']
	starter_coords = random_starters[seed]
	player_name = "Player1"
	if message['name']:
		player_name = message['name']
	new_player = {
		'sid': sid,
		'id': 1,
		'x': random.randint(starter_coords['x1min'],starter_coords['x1max']),
		'y': random.randint(starter_coords['y1min'],starter_coords['y1max']),
		'ready': False,
		'name': player_name
	}
	rooms[message['room']]['players'].append(new_player)
	sids[sid] = message['room']
	await sio.emit('join_room_response', rooms[message['room']], room=message['room'])

@sio.event
async def create_room(sid, message):
	logger.info(f"Client {sid} is attempting to create a room")
	new_room = gen_four_chars()
	random_seed = random.randint(0,3)
	starter_coords = random_starters[random_seed]
	gem_dino_random_list = random.sample(range(0, 9), 2)
	player_name = "Player0"
	if message['name']:
		player_name = message['name']
	rooms[new_room] = {
		'room_id': new_room,
		'players': [
			{
				'sid': sid,
				'id': 0,
				'x': random.randint(starter_coords['x0min'],starter_coords['x0max']),
				'y': random.randint(starter_coords['y0min'],starter_coords['y0max']), 
				'ready': False,
				'name': player_name
			}
		],
		'start_time': None,
		'end_time': None,
		'chat_history': [],
		'random_seed': random_seed,
		'gem': gem_dino_room_layouts[gem_dino_random_list[0]],
		'dino': gem_dino_room_layouts[gem_dino_random_list[1]]
	}
	sids[sid] = new_room
	sio.enter_room(sid, new_room)
	logger.info(f"New room {new_room} created for client {sid}")
	await sio.emit('create_room_response', rooms[new_room], room=new_room)

# not sure leave is used, can probably remove but waiting to confirm
@sio.event
async def leave(sid, message):
	sio.leave_room(sid, message['room'])
	await sio.emit('my_response', {'data': 'Left room: ' + message['room']}, room=sid)

@sio.event
async def player_ready(sid, message):
	room = sids[sid]
	logger.info(f'Player {sid} in room {room} is ready to start')
	for player in rooms[room]['players']:
		if player['sid'] == sid:
			player['ready'] = True
	all_ready = True
	for player in rooms[room]['players']:
		if player['ready'] == False:
			all_ready = False
	if all_ready:
		logger.info(f'All players in room {room} are ready to start the game!')
		rooms[room]['start_time'] = time.time()
		await sio.emit('game_start', rooms[room], room=room)

@sio.event
async def chat(sid, message):
	current_room = sids[sid]
	rooms[current_room]['chat_history'].append(message['text'])
	logger.info(f"Chat message - room {current_room} - sid {sid} - {message['text']}")
	await sio.emit('new_chat_message', {'chat_sender': sid, 'chat_message': message['text']}, room=current_room)


# -----
# Admin commands
@sio.event
async def get_rooms(sid):
	logger.info(f"--ADMIN-- Rooms list requested by {sid}")
	await sio.emit('admin_rooms_response', rooms, room=sid)

@sio.event
async def get_sids(sid):
	logger.info(f"--ADMIN-- Sids list requested by {sid}")
	await sio.emit('admin_sids_response', sids, room=sid)

@sio.event
async def clean_rooms(sid):
	logger.info(f"--ADMIN-- Cleaning up rooms, requested by {sid}")
	rooms_to_clean = []
	for room in rooms:
		if len(room['players']) == 0:
			rooms_to_clean.append(room['room_id'])
	for room in rooms_to_clean:
		logger.info(f"--ADMIN-- deleting room {room} from rooms list")
		del rooms[room]

# -----
# Connect and disconnect events
@sio.event
async def disconnect_request(sid):
	await sio.disconnect(sid)

@sio.event
async def connect(sid, environ):
	logger.info(f"New connection from {sid}")
	await sio.emit('connect_response', {'sid': sid}, room=sid)

@sio.event
async def disconnect(sid):
	current_room = sids[sid]
	for player in rooms[current_room]['players']:
		if player['sid'] == sid:
			rooms[current_room]['players'].remove(player)
	del sids[sid]
	logger.info(f'Client {sid} disconnected and left room {current_room}')
	await sio.emit('player_left_room', room=current_room)


# -----
# Helper functions
def gen_four_chars():
	return ''.join(random.choices(string.ascii_lowercase, k=4))

def check_for_game_over(room_id):
	player1x = rooms[room_id]['players'][0]['x']
	player1y = rooms[room_id]['players'][0]['y']
	player2x = rooms[room_id]['players'][1]['x']
	player2y = rooms[room_id]['players'][1]['y']
	game_over = False
	# I'm sure there's a better way to do this, but ah well
	if player1x == player2x:
		if abs(player1y - player2y) == 1:
			game_over = True
	elif player1y == player2y:
		if abs(player1x - player2x) == 1:
			game_over = True
	if game_over:
		rooms[room_id]['end_time'] = time.time()
		elapsed_time = rooms[room_id]['end_time'] - rooms[room_id]['start_time']
		logger.info(f'Room {room_id} is finished!  Total time was {elapsed_time}')
		return elapsed_time
	else:
		return None

def save_to_leaderboard_file(room_id):
	new_entry = {
		'time': rooms[room_id]['end_time'] - rooms[room_id]['start_time'],
		'player0name': rooms[room_id]['players'][0]['name'],
		'player1name': rooms[room_id]['players'][1]['name'],
		'room_id': room_id,
		'date': datetime.datetime.now().strftime("%Y-%m-%d")
	}
	with open('/home/ec2-user/leaderboard.json','a') as file:
		file.write(json.dumps(new_entry) + '\n')
		

# -----
# Main Tornado web server
def main():
	parse_command_line()
	app = tornado.web.Application(
		[
			(r"/app", MainHandler),
			(r"/socket.io/", SocketHandler),
			(r"/leaderboard", LeaderboardHandler),
			(r'/(leaderboard\.json)', LeaderboardJsonHandler, {'path': '/home/ec2-user/'}),
		],
		template_path=os.path.join(os.path.dirname(__file__), "templates"),
		static_path=os.path.join(os.path.dirname(__file__), "static"),
		debug=options.debug,
	)
	app.listen(options.port)
	logger.info("===== Starting Tornado Server =====")
	tornado.ioloop.IOLoop.current().start()

if __name__ == "__main__":
	main()
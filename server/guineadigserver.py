import os

import tornado.ioloop
from tornado.options import define, options, parse_command_line
import tornado.web

import socketio

define("port", default=5000, help="run on the given port", type=int)
define("debug", default=False, help="run in debug mode")

sio = socketio.AsyncServer(async_mode='tornado', cors_allowed_origins=[])
_Handler = socketio.get_tornado_handler(sio)


async def background_task():
	"""Example of how to send server generated events to clients."""
	count = 0
	while True:
		await sio.sleep(10)
		count += 1
		await sio.emit('my_response', {'data': 'Server generated event'})


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
async def my_event(sid, message):
	await sio.emit('my_response', {'data': message['data']}, room=sid)


@sio.event
async def my_broadcast_event(sid, message):
	await sio.emit('my_response', {'data': message['data']})


@sio.event
async def join(sid, message):
	sio.enter_room(sid, message['room'])
	await sio.emit('my_response', {'data': 'Entered room: ' + message['room']},
				   room=sid)

@sio.event
async def leave(sid, message):
	sio.leave_room(sid, message['room'])
	await sio.emit('my_response', {'data': 'Left room: ' + message['room']},
				   room=sid)


@sio.event
async def close_room(sid, message):
	await sio.emit('my_response',
				   {'data': 'Room ' + message['room'] + ' is closing.'},
				   room=message['room'])
	await sio.close_room(message['room'])


@sio.event
async def my_room_event(sid, message):
	await sio.emit('my_response', {'data': message['data']},
				   room=message['room'])


@sio.event
async def disconnect_request(sid):
	await sio.disconnect(sid)


@sio.event
async def connect(sid, environ):
	await sio.emit('my_response', {'data': 'Connected', 'count': 0}, room=sid)


@sio.event
def disconnect(sid):
	print('Client disconnected')


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
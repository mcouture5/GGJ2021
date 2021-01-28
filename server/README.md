# Guinea Dig Server
This is the server code for Guinea Dig.

## Tech stack
- Python 3.7.9
- Tornado 6.1
- Server is tested on Amazon Linux 2

## Socket.io connection

You should be able to connect to the server running on guineadig.parlette.org:5000/socket.io/

## Systemctl script

I have the contents of 'systemdscript.txt' in /etc/systemd/system/gameserver.service , so now I can run commands like:

```bash
sudo systemctl enable gameserver.service
sudo systemctl start gameserver.service
```

Any new updates to the server code should be able to do:

```bash
git fetch
git pull
sudo systemctl restart gameserver.service
```
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict

app = FastAPI()

class GameManager:
    def __init__(self):
        self.players: Dict[str, WebSocket] = {}  # Store players as {id: websocket}
        self.player_count = 0

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.player_count += 1
        player_id = f"player{self.player_count}"  # Assign unique player ID
        self.players[player_id] = websocket
        return player_id

    def disconnect(self, websocket: WebSocket):
        for player_id, ws in self.players.items():
            if ws == websocket:
                del self.players[player_id]
                self.player_count -= 1
                break

    async def notify_players(self):
        """Notify all connected players about their roles."""
        for player_id, websocket in self.players.items():
            await websocket.send_json({"type": "init", "message": {"player_id": player_id}})

    def is_ready(self):
        return len(self.players) == 2  # Game starts only with 2 players

manager = GameManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    player_id = await manager.connect(websocket)
    try:
        if manager.is_ready():
            await manager.notify_players()  # Notify both players
        else:
            await websocket.send_json({"type": "waiting", "message": "Waiting for another player..."})
        while True:
            data = await websocket.receive_json()
            # Broadcast received data to all players
            for ws in manager.players.values():
                if ws != websocket:  # Avoid echoing back to the sender
                    await ws.send_json({"type":"movement","message":data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

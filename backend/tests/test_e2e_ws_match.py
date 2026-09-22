import asyncio
import json
import websockets
import httpx

API_BASE = "http://127.0.0.1:8000"
WS_BASE = "ws://127.0.0.1:8000"

async def test_full_match_e2e():
    async with httpx.AsyncClient() as client:
        # 1. Host creates room (duration 5s, 3 rounds for fast test)
        res1 = await client.post(f"{API_BASE}/api/rooms", json={
            "nickname": "HostAlice",
            "avatar_id": "cyber_1",
            "round_duration_sec": 5,
            "max_rounds": 3
        })
        assert res1.status_code == 201, f"Failed room creation: {res1.text}"
        host_data = res1.json()
        room_code = host_data["room_code"]
        host_token = host_data["session_token"]
        host_id = host_data["player_id"]
        print(f"[TEST] Host Alice created room {room_code}")

        # 2. Player 2 joins room
        res2 = await client.post(f"{API_BASE}/api/rooms/join", json={
            "room_code": room_code,
            "nickname": "BobTraitor",
            "avatar_id": "cyber_2"
        })
        assert res2.status_code == 200, f"Failed join: {res2.text}"
        bob_data = res2.json()
        bob_token = bob_data["session_token"]
        bob_id = bob_data["player_id"]
        print(f"[TEST] Bob joined room {room_code}")

    # 3. Connect both WebSockets
    host_ws_url = f"{WS_BASE}/ws/{room_code}?token={host_token}"
    bob_ws_url = f"{WS_BASE}/ws/{room_code}?token={bob_token}"

    async with websockets.connect(host_ws_url) as ws_host, websockets.connect(bob_ws_url) as ws_bob:
        # Receive initial snapshots
        host_init = json.loads(await ws_host.recv())
        bob_init = json.loads(await ws_bob.recv())
        print("[TEST] Both WebSockets connected and received initial state.")

        # Bob sets ready
        await ws_bob.send(json.dumps({"type": "PLAYER_READY", "data": {"ready": True}}))
        # Wait for broadcast
        msg = json.loads(await ws_host.recv())
        print(f"[TEST] Host received ready broadcast: type={msg.get('type')}")

        # Host starts match
        await ws_host.send(json.dumps({"type": "START_GAME", "data": {}}))
        print("[TEST] Host sent START_GAME.")

        # Round 1 Starts
        # Wait for ROUND_START
        while True:
            ev = json.loads(await ws_host.recv())
            if ev.get("type") == "ROUND_START":
                print(f"[TEST] Round 1 started! Pot: {ev['data']['pot']}")
                break

        # Round 1 Secret choices:
        # Alice chooses COOPERATE
        # Bob chooses BETRAY (Solo Heist!)
        await ws_host.send(json.dumps({"type": "SUBMIT_CHOICE", "data": {"choice": "COOPERATE"}}))
        await ws_bob.send(json.dumps({"type": "SUBMIT_CHOICE", "data": {"choice": "BETRAY"}}))
        print("[TEST] Both submitted secret choices for Round 1.")

        # Wait for ROUND_REVEAL
        while True:
            ev = json.loads(await ws_host.recv())
            if ev.get("type") == "ROUND_REVEAL":
                print(f"[TEST] Round 1 Revealed: Outcome = {ev['data']['outcome_type']}")
                print(f"[TEST] Warden Commentary: {ev['data']['warden_commentary']}")
                assert ev["data"]["outcome_type"] == "SOLO_BETRAYAL"
                break

        # Wait for Round 2
        while True:
            ev = json.loads(await ws_host.recv())
            if ev.get("type") == "ROUND_START":
                print(f"[TEST] Round 2 started! Pot: {ev['data']['pot']}")
                break

        # Round 2: Both BETRAY (Mutual Greed Collapse!)
        await ws_host.send(json.dumps({"type": "SUBMIT_CHOICE", "data": {"choice": "BETRAY"}}))
        await ws_bob.send(json.dumps({"type": "SUBMIT_CHOICE", "data": {"choice": "BETRAY"}}))
        print("[TEST] Both submitted BETRAY for Round 2.")

        # Wait for ROUND_REVEAL
        while True:
            ev = json.loads(await ws_host.recv())
            if ev.get("type") == "ROUND_REVEAL":
                print(f"[TEST] Round 2 Revealed: Outcome = {ev['data']['outcome_type']}")
                print(f"[TEST] Warden Commentary: {ev['data']['warden_commentary']}")
                assert ev["data"]["outcome_type"] == "MUTUAL_BETRAYAL"
                break

        # Wait for Round 3
        while True:
            ev = json.loads(await ws_host.recv())
            if ev.get("type") == "ROUND_START":
                print(f"[TEST] Round 3 started! Pot: {ev['data']['pot']}")
                break

        # Round 3: Both COOPERATE (Mutual Peace!)
        await ws_host.send(json.dumps({"type": "SUBMIT_CHOICE", "data": {"choice": "COOPERATE"}}))
        await ws_bob.send(json.dumps({"type": "SUBMIT_CHOICE", "data": {"choice": "COOPERATE"}}))
        print("[TEST] Both submitted COOPERATE for Round 3.")

        # Wait for ROUND_REVEAL
        while True:
            ev = json.loads(await ws_host.recv())
            if ev.get("type") == "ROUND_REVEAL":
                print(f"[TEST] Round 3 Revealed: Outcome = {ev['data']['outcome_type']}")
                print(f"[TEST] Warden Commentary: {ev['data']['warden_commentary']}")
                assert ev["data"]["outcome_type"] == "ALL_COOPERATE"
                break

        # Wait for GAME_OVER
        while True:
            ev = json.loads(await ws_host.recv())
            if ev.get("type") == "GAME_OVER":
                print(f"[TEST] GAME OVER! Winner = {ev['data']['winner']}")
                print(f"[TEST] Podium = {ev['data']['podium']}")
                assert ev["data"]["winner"]["nickname"] == "BobTraitor"
                break

        print("[TEST] E2E MATCH VERIFICATION 100% SUCCESSFUL!")

if __name__ == "__main__":
    asyncio.run(test_full_match_e2e())

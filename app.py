import json
import heapq
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler


# --------------------------------------------------
# MANHATTAN DISTANCE
# --------------------------------------------------

def manhattan_distance(current, goal):
    return abs(current[0] - goal[0]) + abs(current[1] - goal[1])


# --------------------------------------------------
# BEST FIRST SEARCH
# --------------------------------------------------

def best_first_search(maze, start, goal):

    start = tuple(start)
    goal = tuple(goal)

    priority_queue = []

    # Priority = heuristic distance
    heapq.heappush(
        priority_queue,
        (manhattan_distance(start, goal), start)
    )

    visited = set()
    parent = {start: None}

    explored = []

    directions = [
        (-1, 0),   # Up
        (1, 0),    # Down
        (0, -1),   # Left
        (0, 1)     # Right
    ]

    start_time = time.perf_counter()

    while priority_queue:

        _, current = heapq.heappop(priority_queue)

        if current in visited:
            continue

        visited.add(current)

        explored.append(list(current))

        # Goal reached
        if current == goal:

            path = []

            node = current

            while node is not None:

                path.append(list(node))

                node = parent[node]

            path.reverse()

            end_time = time.perf_counter()

            return {
                "found": True,
                "path": path,
                "explored": explored,
                "path_length": len(path),
                "explored_count": len(explored),
                "time": round(
                    (end_time - start_time) * 1000,
                    4
                )
            }

        row, col = current

        for dr, dc in directions:

            new_row = row + dr
            new_col = col + dc

            # Check boundaries
            if (
                new_row < 0
                or new_row >= len(maze)
                or new_col < 0
                or new_col >= len(maze[0])
            ):
                continue

            # Wall
            if maze[new_row][new_col] == 1:
                continue

            neighbor = (new_row, new_col)

            if neighbor in visited:
                continue

            if neighbor not in parent:

                parent[neighbor] = current

                priority = manhattan_distance(
                    neighbor,
                    goal
                )

                heapq.heappush(
                    priority_queue,
                    (priority, neighbor)
                )

    end_time = time.perf_counter()

    return {
        "found": False,
        "path": [],
        "explored": explored,
        "path_length": 0,
        "explored_count": len(explored),
        "time": round(
            (end_time - start_time) * 1000,
            4
        )
    }


# --------------------------------------------------
# HTTP SERVER
# --------------------------------------------------

class MazeHandler(SimpleHTTPRequestHandler):

    def do_POST(self):

        if self.path != "/solve":

            self.send_error(
                404,
                "Endpoint not found"
            )

            return

        try:

            content_length = int(
                self.headers.get("Content-Length", 0)
            )

            body = self.rfile.read(content_length)

            data = json.loads(body)

            maze = data["maze"]
            start = data["start"]
            goal = data["goal"]

            result = best_first_search(
                maze,
                start,
                goal
            )

            response = json.dumps(result)

            response_bytes = response.encode("utf-8")

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.send_header(
                "Content-Length",
                str(len(response_bytes))
            )

            self.send_header(
                "Access-Control-Allow-Origin",
                "*"
            )

            self.end_headers()

            self.wfile.write(response_bytes)

        except Exception as error:

            response = json.dumps({
                "found": False,
                "path": [],
                "explored": [],
                "error": str(error)
            })

            response_bytes = response.encode("utf-8")

            self.send_response(500)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.send_header(
                "Content-Length",
                str(len(response_bytes))
            )

            self.end_headers()

            self.wfile.write(response_bytes)


# --------------------------------------------------
# START SERVER
# --------------------------------------------------

PORT = 8000

server = HTTPServer(
    ("localhost", PORT),
    MazeHandler
)

print("---------------------------------------")
print(" Maze Game - Best First Search")
print("---------------------------------------")
print("Server running at:")
print("http://localhost:8000")
print("---------------------------------------")
print("Press CTRL + C to stop the server.")

server.serve_forever()
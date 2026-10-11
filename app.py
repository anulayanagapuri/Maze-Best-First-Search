
import json
import heapq
import time
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler


def manhattan_distance(current, goal):
    return abs(current[0] - goal[0]) + abs(current[1] - goal[1])


def best_first_search(maze, start, goal):
    start = tuple(start)
    goal = tuple(goal)

    priority_queue = []
    heapq.heappush(priority_queue, (manhattan_distance(start, goal), start))

    visited = set()
    parent = {start: None}
    explored = []

    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    start_time = time.perf_counter()

    while priority_queue:
        _, current = heapq.heappop(priority_queue)

        if current in visited:
            continue

        visited.add(current)
        explored.append(list(current))

        if current == goal:
            path = []
            node = current

            while node is not None:
                path.append(list(node))
                node = parent[node]

            path.reverse()

            return {
                "found": True,
                "path": path,
                "explored": explored,
                "path_length": len(path),
                "explored_count": len(explored),
                "time": round((time.perf_counter() - start_time) * 1000, 4)
            }

        row, col = current

        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc

            if not (0 <= new_row < len(maze) and
                    0 <= new_col < len(maze[0])):
                continue

            if maze[new_row][new_col] == 1:
                continue

            neighbor = (new_row, new_col)

            if neighbor in visited or neighbor in parent:
                continue

            parent[neighbor] = current
            priority = manhattan_distance(neighbor, goal)
            heapq.heappush(priority_queue, (priority, neighbor))

    return {
        "found": False,
        "path": [],
        "explored": explored,
        "path_length": 0,
        "explored_count": len(explored),
        "time": round((time.perf_counter() - start_time) * 1000, 4)
    }


class MazeHandler(SimpleHTTPRequestHandler):

    def do_POST(self):
        if self.path != "/solve":
            self.send_error(404, "Endpoint not found")
            return

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(content_length))

            result = best_first_search(
                data["maze"], data["start"], data["goal"]
            )

            response_bytes = json.dumps(result).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(response_bytes)

        except Exception as error:
            response_bytes = json.dumps({
                "found": False,
                "path": [],
                "explored": [],
                "error": str(error)
            }).encode("utf-8")

            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response_bytes)))
            self.end_headers()
            self.wfile.write(response_bytes)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))

    class ProjectHandler(MazeHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(
                *args,
                directory=os.path.dirname(os.path.abspath(__file__)),
                **kwargs
            )

    server = HTTPServer(("0.0.0.0", port), ProjectHandler)

    print(f"Maze Game server running on port {port}")
    server.serve_forever()

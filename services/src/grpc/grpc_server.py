import grpc
from concurrent import futures
import recipe_search_pb2
import recipe_search_pb2_grpc
from src.search.search_bm25 import search  # твоята BM25/embedding функция

class RecipeSearchService(recipe_search_pb2_grpc.RecipeSearchServicer):
    def Search(self, request, context):
        query = request.query
        top_k = int(request.top_k) if request.top_k > 0 else 10
        results = search(query, top_k)
        recipes = []
        for r in results:
            recipes.append(recipe_search_pb2.Recipe(
                title=str(r['title']),
                instructions=" ".join(r.get('instructions', [])) if isinstance(r.get('instructions'), list) else str(r.get('instructions', "")),
                ingredients=[str(i['name']) for i in r.get('ingredients', [])],
                img=str(r.get('img', "") or ''),
                id=str(r.get('id', ""))
            ))
        return recipe_search_pb2.SearchResponse(results=recipes)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    recipe_search_pb2_grpc.add_RecipeSearchServicer_to_server(RecipeSearchService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    serve()

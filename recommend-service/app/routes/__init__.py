from .post import PostsApi
from .default import DefaultApi

def initialize_routes(api):
  api.add_resource(DefaultApi, '/')
  api.add_resource(PostsApi, '/api/posts')
from flask import Blueprint, Response, request
from flask import Response, request
from ..models.post import Post
from flask_restful import Resource
from ..services.post import PostService

class PostsApi(Resource):
  
  def get(self):
    user_id = request.args.get("user_id")
    top_n = int(request.args.get("top_n", 5))
    posts = PostService.recommend_posts(user_id, top_n)
    return Response(posts, mimetype="application/json", status=200)

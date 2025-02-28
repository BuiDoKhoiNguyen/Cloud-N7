from ..models.post import Post
from ..models.user import User
from .user import UserService
from .models.post import hybrid_recommend

class PostService:
    @staticmethod
    def recommend_posts(user_id, top_n):
        return hybrid_recommend(user_id, top_n)
        
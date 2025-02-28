from ..models.user import User

class UserService:
  @staticmethod
  def get_friends(user_id):
    """Lấy danh sách bạn bè của user"""
    user = User.objects(user_id=user_id).first()
    if user:
        return user.friends
    return []

  @staticmethod
  def get_interactions(user_id):
    user = User.objects(user_id=user_id).first()
    if not user:
        return []

    return [{"post_id": interaction.post_id, "reaction": interaction.reaction} for interaction in user.interactions]

from . import db

class Interaction(db.EmbeddedDocument):
  post_id = db.StringField(required=True)  # Định dạng ID dạng String
  reaction = db.StringField(required=True, choices=["like", "dislike", "share", "comment"])  # Hạn chế giá trị hợp lệ

class User(db.Document):
  user_id = db.StringField(required=True, unique=True)
  interactions = db.ListField(db.EmbeddedDocumentField(Interaction))
  friends = db.ListField(db.StringField())  # Danh sách ID bạn bè

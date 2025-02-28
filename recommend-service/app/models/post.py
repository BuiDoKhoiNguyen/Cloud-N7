from . import db

class Post(db.Document):
  post_id = db.StringField(required=True, unique=True)
  content = db.StringField(required=True)
  user_id = db.StringField(required=True)
